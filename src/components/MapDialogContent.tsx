'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import { createPortal } from 'react-dom';
import Geocoder from 'leaflet-control-geocoder';
import { toast } from 'react-hot-toast';

interface GeocoderEvent {
  geocode: {
    bbox: L.LatLngBounds;
    center: L.LatLng;
    name: string;
  };
}

interface MapDialogContentProps {
  onLocationSelect: (coordinates: { latitude: number; longitude: number; address: string }) => void;
  initialLocation?: { latitude: number; longitude: number };
  onClose: () => void;
}

export default function MapDialogContent({ onLocationSelect, initialLocation, onClose }: MapDialogContentProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [selectedLocation, setSelectedLocation] = useState<L.LatLng | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const markerRef = useRef<L.Marker | null>(null);
  const [mounted, setMounted] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mounted || !mapContainerRef.current || mapRef.current) return;

    // Initialize map
    const map = L.map(mapContainerRef.current, {
      center: initialLocation 
        ? [initialLocation.latitude, initialLocation.longitude]
        : [12.9716, 77.5946], // Default to Bangalore
      zoom: 13,
      zoomControl: true
    });

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add geocoder control
    const geocoder = new Geocoder({
      defaultMarkGeocode: false,
      placeholder: 'Search for a location...',
      errorMessage: 'No results found.'
    }).addTo(map);

    // Handle geocoder results
    geocoder.on('markgeocode', (e: GeocoderEvent) => {
      const { center, name } = e.geocode;
      setSelectedLocation(center);
      setSelectedAddress(name);
      updateMarker(center);
      map.setView(center, 13);
    });

    // Handle map clicks
    map.on('click', async (e) => {
      setSelectedLocation(e.latlng);
      updateMarker(e.latlng);
      
      // Reverse geocode the clicked location
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}&zoom=18&addressdetails=1`
        );
        const data = await response.json();
        setSelectedAddress(data.display_name);
      } catch (error) {
        console.error('Error reverse geocoding:', error);
        setSelectedAddress('');
      }
    });

    // Set initial marker if location provided
    if (initialLocation) {
      const initialLatLng = L.latLng(initialLocation.latitude, initialLocation.longitude);
      setSelectedLocation(initialLatLng);
      updateMarker(initialLatLng);
    }

    mapRef.current = map;

    // Force a resize event to ensure the map renders correctly
    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    };
  }, [mounted, initialLocation]);

  // Handle mounting state
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const updateMarker = (latlng: L.LatLng) => {
    if (!mapRef.current) return;
    
    if (markerRef.current) {
      markerRef.current.setLatLng(latlng);
    } else {
      markerRef.current = L.marker(latlng).addTo(mapRef.current);
    }
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelect({
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
        address: selectedAddress
      });
      toast.success('Location selected successfully!');
      onClose();
    }
  };

  const dialogContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-[90vw] max-w-4xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-[10000] text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-white dark:bg-gray-800 rounded-full p-1 shadow-md"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Map container */}
        <div 
          ref={mapContainerRef} 
          className="h-[60vh] w-full rounded-lg relative z-[9998]"
          style={{ minHeight: '400px' }}
        />
        
        {/* Selected location info */}
        {selectedLocation && (
          <div className="mt-4 space-y-2">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Selected coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
            </div>
            {selectedAddress && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Address: {selectedAddress}
              </div>
            )}
          </div>
        )}

        {/* Confirm button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleConfirm}
            disabled={!selectedLocation}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
              selectedLocation 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;

  return createPortal(dialogContent, document.body);
} 