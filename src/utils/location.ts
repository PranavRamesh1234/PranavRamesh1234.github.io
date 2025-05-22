interface Coordinates {
  latitude: number;
  longitude: number;
}

// Nominatim API configuration
const NOMINATIM_CONFIG = {
  baseUrl: 'https://nominatim.openstreetmap.org',
  userAgent: 'BookMarket/1.0',
  cacheDuration: 24 * 60 * 60 * 1000, // 24 hours
  maxRetries: 3,
  retryDelay: 1000, // 1 second
};

// Cache for geocoding results
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const geocodeCache = new Map<string, CacheEntry<Coordinates>>();
const reverseGeocodeCache = new Map<string, CacheEntry<string>>();

// Rate limiting for Nominatim API
let lastRequestTime = 0;

async function waitForRateLimit() {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < NOMINATIM_CONFIG.retryDelay) {
    await new Promise(resolve => setTimeout(resolve, NOMINATIM_CONFIG.retryDelay - timeSinceLastRequest));
  }
  lastRequestTime = Date.now();
}

// Fetch with timeout and proper headers
async function fetchNominatim(url: string): Promise<any> {
  try {
    const fullUrl = url.startsWith('http') ? url : `${NOMINATIM_CONFIG.baseUrl}${url}`;
    const response = await fetch(fullUrl, {
      headers: {
        'User-Agent': NOMINATIM_CONFIG.userAgent
      }
    });

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Invalid response format from Nominatim API');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching from Nominatim:', error);
    throw error;
  }
}

// Check if cache entry is still valid
function isCacheValid<T>(entry: CacheEntry<T> | undefined): boolean {
  if (!entry) return false;
  return Date.now() - entry.timestamp < NOMINATIM_CONFIG.cacheDuration;
}

// Get current location with improved error handling and caching
export async function getCurrentLocation(): Promise<{ locationString: string; coordinates: Coordinates }> {
  if (!navigator.geolocation) {
    throw new Error('Geolocation is not supported by your browser');
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const coordinates = { latitude, longitude };
          const cacheKey = `${latitude},${longitude}`;

          // Check cache first
          const cachedAddress = reverseGeocodeCache.get(cacheKey);
          if (isCacheValid(cachedAddress)) {
            console.log('Using cached address');
            resolve({ locationString: cachedAddress!.data, coordinates });
            return;
          }

          // Try reverse geocoding
          try {
            await waitForRateLimit();
            console.log('Fetching address from Nominatim...');
            
            const url = new URL('/reverse', NOMINATIM_CONFIG.baseUrl);
            url.searchParams.append('format', 'json');
            url.searchParams.append('lat', latitude.toString());
            url.searchParams.append('lon', longitude.toString());
            url.searchParams.append('accept-language', 'en-US,en;q=0.9');
            
            const data = await fetchNominatim(url.toString());
            console.log('Nominatim API response:', data);

            if (!data || !data.display_name) {
              throw new Error('No address found for these coordinates');
            }

            // Cache the result
            reverseGeocodeCache.set(cacheKey, {
              data: data.display_name,
              timestamp: Date.now()
            });

            resolve({ locationString: data.display_name, coordinates });
          } catch (error) {
            console.error('Error in reverse geocoding:', error);

            // Try forward geocoding as fallback
            try {
              await waitForRateLimit();
              console.log('Trying forward geocoding...');
              
              const url = new URL('/search', NOMINATIM_CONFIG.baseUrl);
              url.searchParams.append('format', 'json');
              url.searchParams.append('q', `${latitude} ${longitude}`);
              url.searchParams.append('accept-language', 'en-US,en;q=0.9');
              
              const data = await fetchNominatim(url.toString());
              if (data && data.length > 0 && data[0].display_name) {
                const address = data[0].display_name;
                reverseGeocodeCache.set(cacheKey, {
                  data: address,
                  timestamp: Date.now()
                });
                resolve({ locationString: address, coordinates });
                return;
              }
            } catch (fallbackError) {
              console.error('Fallback geocoding failed:', fallbackError);
            }

            // If all attempts fail, use a descriptive fallback
            const fallbackAddress = `Location at ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            console.warn('Using fallback address:', fallbackAddress);
            reverseGeocodeCache.set(cacheKey, {
              data: fallbackAddress,
              timestamp: Date.now()
            });
            resolve({ locationString: fallbackAddress, coordinates });
          }
        } catch (error) {
          console.error('Error in getCurrentLocation:', error);
          reject(error);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error('Please allow location access to find books near you'));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error('Location information is unavailable'));
            break;
          case error.TIMEOUT:
            reject(new Error('Location request timed out'));
            break;
          default:
            reject(new Error('An unknown error occurred'));
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000, // Increase timeout to 10 seconds
        maximumAge: 0
      }
    );
  });
}

// Calculate distance between two coordinates using the Haversine formula
function calculateDistanceBetweenCoordinates(
  coords1: Coordinates,
  coords2: Coordinates
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(coords2.latitude - coords1.latitude);
  const dLon = toRad(coords2.longitude - coords1.longitude);
  
  const lat1 = toRad(coords1.latitude);
  const lat2 = toRad(coords2.latitude);

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;

  return distance;
}

// Convert degrees to radians
function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Convert address to coordinates using OpenStreetMap Nominatim
export async function geocodeAddress(address: string | null | undefined): Promise<Coordinates> {
  if (!address) {
    throw new Error('No address provided');
  }

  const cacheKey = address.toLowerCase();
  const cached = geocodeCache.get(cacheKey);
  
  if (cached && isCacheValid(cached)) {
    return cached.data;
  }

  try {
    await waitForRateLimit();
    const url = new URL('/search', NOMINATIM_CONFIG.baseUrl);
    url.searchParams.append('format', 'json');
    url.searchParams.append('q', address);
    url.searchParams.append('limit', '1');
    url.searchParams.append('accept-language', 'en-US,en;q=0.9');
    
    const data = await fetchNominatim(url.toString());
    
    if (!data || !data[0]?.lat || !data[0]?.lon) {
      throw new Error('No results found');
    }

    const result: Coordinates = {
      latitude: parseFloat(data[0].lat),
      longitude: parseFloat(data[0].lon)
    };

    geocodeCache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });
    
    return result;
  } catch (error) {
    console.error('Error geocoding address:', error);
    throw error;
  }
}

export async function reverseGeocodeCoordinates(latitude: number, longitude: number): Promise<string> {
  const cacheKey = `${latitude},${longitude}`;
  const cached = reverseGeocodeCache.get(cacheKey);
  
  if (cached && isCacheValid(cached)) {
    return cached.data;
  }

  try {
    const url = new URL('/reverse', NOMINATIM_CONFIG.baseUrl);
    url.searchParams.append('format', 'json');
    url.searchParams.append('lat', latitude.toString());
    url.searchParams.append('lon', longitude.toString());
    url.searchParams.append('zoom', '18');
    url.searchParams.append('addressdetails', '1');
    
    const data = await fetchNominatim(url.toString());
    
    if (!data || !data.display_name) {
      throw new Error('No results found');
    }

    const result = data.display_name;
    reverseGeocodeCache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });
    
    return result;
  } catch (error) {
    console.error('Error reverse geocoding coordinates:', error);
    throw error;
  }
}

// Calculate distance between two addresses
export async function calculateDistance(
  location1: string | null | undefined,
  location2: string | null | undefined,
  coordinates1?: string | null,
  coordinates2?: string | null,
  mapCoordinates1?: { lat: number; lng: number },
  mapCoordinates2?: { lat: number; lng: number }
): Promise<number> {
  try {
    // First try to parse coordinates directly
    const coords1 = parseCoordinates(coordinates1);
    const coords2 = parseCoordinates(coordinates2);

    // If we have both coordinates, calculate distance directly
    if (coords1 && coords2) {
      return calculateDistanceFromCoordinates(coords1, coords2);
    }

    // If we have map coordinates, use those
    if (mapCoordinates1 && mapCoordinates2) {
      return calculateDistanceFromCoordinates(
        { latitude: mapCoordinates1.lat, longitude: mapCoordinates1.lng },
        { latitude: mapCoordinates2.lat, longitude: mapCoordinates2.lng }
      );
    }

    // If we have one set of coordinates and one map coordinates
    if (coords1 && mapCoordinates2) {
      return calculateDistanceFromCoordinates(
        coords1,
        { latitude: mapCoordinates2.lat, longitude: mapCoordinates2.lng }
      );
    }
    if (mapCoordinates1 && coords2) {
      return calculateDistanceFromCoordinates(
        { latitude: mapCoordinates1.lat, longitude: mapCoordinates1.lng },
        coords2
      );
    }

    // Only if we don't have coordinates, try geocoding
    const [finalCoords1, finalCoords2] = await Promise.all([
      getCoordinatesWithPriority(coordinates1, location1, mapCoordinates1),
      getCoordinatesWithPriority(coordinates2, location2, mapCoordinates2)
    ]);

    if (!finalCoords1 || !finalCoords2) {
      console.warn('Could not get coordinates for one or both locations');
      return Infinity;
    }

    return calculateDistanceFromCoordinates(finalCoords1, finalCoords2);
  } catch (error) {
    console.error('Error calculating distance:', error);
    return Infinity;
  }
}

function parseCoordinates(str: string | null | undefined): Coordinates | null {
  if (!str) return null;

  // Try parsing JSON string first
  try {
    const parsed = JSON.parse(str);
    if (parsed && typeof parsed.latitude === 'number' && typeof parsed.longitude === 'number') {
      return { latitude: parsed.latitude, longitude: parsed.longitude };
    }
  } catch (e) {
    // Not a JSON string, continue with other formats
  }

  // Try parsing lat,lng format
  const match = str.match(/^(-?\d+\.\d+),\s*(-?\d+\.\d+)$/);
  if (match) {
    const latitude = parseFloat(match[1]);
    const longitude = parseFloat(match[2]);

    if (isNaN(latitude) || isNaN(longitude)) return null;
    if (latitude < -90 || latitude > 90) return null;
    if (longitude < -180 || longitude > 180) return null;

    return { latitude, longitude };
  }

  return null;
}

function calculateDistanceFromCoordinates(coords1: Coordinates, coords2: Coordinates): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(coords2.latitude - coords1.latitude);
  const dLon = toRad(coords2.longitude - coords1.longitude);
  const lat1 = toRad(coords1.latitude);
  const lat2 = toRad(coords2.latitude);

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Get coordinates with priority order
export async function getCoordinatesWithPriority(
  userCoordinates: string | null | undefined,
  userLocation: string | null | undefined,
  mapCoordinates?: { lat: number; lng: number }
): Promise<Coordinates | null> {
  try {
    // Priority 1: Use coordinates from map if provided
    if (mapCoordinates) {
      return {
        latitude: mapCoordinates.lat,
        longitude: mapCoordinates.lng
      };
    }

    // Priority 2: Use stored coordinates if available
    const parsedCoordinates = parseCoordinates(userCoordinates);
    if (parsedCoordinates) {
      return parsedCoordinates;
    }

    // Priority 3: Use location string to get coordinates
    if (userLocation) {
      try {
        // Check if the location is already in coordinate format
        const coordsMatch = userLocation.match(/^(-?\d+\.\d+),\s*(-?\d+\.\d+)$/);
        if (coordsMatch) {
          const latitude = parseFloat(coordsMatch[1]);
          const longitude = parseFloat(coordsMatch[2]);
          if (!isNaN(latitude) && !isNaN(longitude)) {
            return { latitude, longitude };
          }
        }

        // If not coordinates, try geocoding
        return await geocodeAddress(userLocation);
      } catch (error) {
        console.error('Error getting coordinates from location:', error);
        return null;
      }
    }

    return null;
  } catch (error) {
    console.error('Error in getCoordinatesWithPriority:', error);
    return null;
  }
} 