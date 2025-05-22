import { createClient } from '@supabase/supabase-js';
import { Book, BookFormData, GetBooksResponse } from '@/types';
import { useState } from 'react';
import { semanticSearch } from './semantic-search';
import { geocodeAddress } from '@/utils/location';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export const searchBooks = async (query: string) => {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .or(`title.ilike.%${query}%,author.ilike.%${query}%,tags.cs.{${query}}`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Book[];
};

export const addBook = async (bookData: BookFormData, sellerId: string) => {
  try {
    // First, upload images to storage
    const imageUrls: string[] = [];
    for (const image of bookData.images) {
      const fileExt = image.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${sellerId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('book-images')
        .upload(filePath, image);

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('book-images')
        .getPublicUrl(filePath);

      imageUrls.push(publicUrl);
    }

    // Then, insert the book data
    const bookInsertData = {
      title: bookData.title,
      author: bookData.author,
      description: bookData.description,
      price: bookData.price,
      condition: bookData.condition,
      year_of_publication: bookData.yearOfPublication,
      location: bookData.location,
      coordinates: bookData.coordinates,
      category: bookData.category,
      tags: bookData.tags,
      images: imageUrls,
      seller_id: sellerId,
      status: 'available',
      created_at: new Date().toISOString(),
    };

    console.log('Inserting book data:', JSON.stringify(bookInsertData, null, 2));

    const { data, error } = await supabase
      .from('books')
      .insert([bookInsertData])
      .select()
      .single();

    if (error) {
      console.error('Error inserting book:', error);
      throw error;
    }
    return data as Book;
  } catch (error) {
    console.error('Error in addBook:', error);
    throw error;
  }
};

export async function getBook(id: string) {
  const { data: book, error } = await supabase
    .from('books')
    .select(`
      *,
      seller:profiles(
        id,
        full_name,
        avatar_url,
        phone_number,
        email,
        location,
        created_at,
        updated_at
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching book:', error);
    throw error;
  }

  console.log('Fetched book data:', book);
  return book;
}

export const updateBook = async (id: string, bookData: Partial<BookFormData>) => {
  console.log('Updating book with data:', bookData);
  
  // Remove any fields that shouldn't be updated
  const { images, existingImages, yearOfPublication, ...updateData } = bookData;
  
  // Create the final update data with correct field names
  const finalUpdateData: Partial<Book> = {
    ...updateData,
    year_of_publication: yearOfPublication,
  };
  
  // If there are new images, handle them
  if (images && images.length > 0) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User must be authenticated to update book images');
    
    const imageUrls: string[] = [];
    for (const image of images) {
      const fileExt = image.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('book-images')
        .upload(filePath, image);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('book-images')
        .getPublicUrl(filePath);

      imageUrls.push(publicUrl);
    }

    // Combine existing and new images
    finalUpdateData.images = [...(existingImages || []), ...imageUrls];
  }

  const { data, error } = await supabase
    .from('books')
    .update(finalUpdateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating book:', error);
    throw error;
  }
  
  return data as Book;
};

export const getSellerBooks = async (sellerId: string) => {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Book[];
};

export async function getBooks(params: URLSearchParams | undefined): Promise<GetBooksResponse> {
  if (!params) {
    params = new URLSearchParams();
  }
  
  const query = params.get('q');
  const category = params.get('category');
  const board = params.get('board');
  const classLevel = params.get('class');
  const city = params.get('city');
  const priceStatus = params.get('priceStatus');
  const price = params.get('price');
  const condition = params.get('condition');
  const sort = params.get('sort') || 'newest';
  const page = parseInt(params.get('page') || '1');
  const limit = parseInt(params.get('limit') || '12');
  const location = params.get('location');
  const minPrice = params.get('minPrice');
  const maxPrice = params.get('maxPrice');

  // Get user's location from their profile if not provided in search params
  let userLocation = location;
  if (!userLocation) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('location')
        .eq('id', user.id)
        .single();
      if (profile?.location) {
        userLocation = profile.location;
      }
    }
  }

  let supabaseQuery = supabase
    .from('books')
    .select('*, seller:profiles(*)', { count: 'exact' })
    .eq('status', 'available');

  // Apply filters
  if (category) {
    const categories = category.split(',');
    supabaseQuery = supabaseQuery.in('category', categories);
  }
  if (board) {
    const boards = board.split(',');
    supabaseQuery = supabaseQuery.in('board', boards);
  }
  if (classLevel) {
    const classLevels = classLevel.split(',');
    supabaseQuery = supabaseQuery.in('class_level', classLevels);
  }
  if (city) {
    supabaseQuery = supabaseQuery.eq('city', city);
  }
  if (condition) {
    supabaseQuery = supabaseQuery.eq('condition', condition);
  }
  if (priceStatus) {
    supabaseQuery = supabaseQuery.eq('price_status', priceStatus);
  }
  if (minPrice) {
    supabaseQuery = supabaseQuery.gte('price', minPrice);
  }
  if (maxPrice) {
    supabaseQuery = supabaseQuery.lte('price', maxPrice);
  }

  // Apply sorting
  switch (sort) {
    case 'price_asc':
      supabaseQuery = supabaseQuery.order('price', { ascending: true });
      break;
    case 'price_desc':
      supabaseQuery = supabaseQuery.order('price', { ascending: false });
      break;
    case 'date_asc':
      supabaseQuery = supabaseQuery.order('created_at', { ascending: true });
      break;
    case 'date_desc':
      supabaseQuery = supabaseQuery.order('created_at', { ascending: false });
      break;
    case 'relevance':
      if (query) {
        supabaseQuery = supabaseQuery.textSearch('title', query, {
          type: 'websearch',
          config: 'english'
        });
      } else {
        supabaseQuery = supabaseQuery.order('created_at', { ascending: false });
      }
      break;
    default: // 'newest'
      supabaseQuery = supabaseQuery.order('created_at', { ascending: false });
  }

  // Calculate pagination
  const start = (page - 1) * limit;

  // Get total count and data
  const { data, error, count } = await supabaseQuery
    .range(start, start + limit - 1);

  if (error) {
    console.error('Error fetching books:', error);
    throw error;
  }

  let filteredData = data || [];

  // Apply semantic search if query exists
  if (query) {
    try {
      const results = await semanticSearch(
        query,
        filteredData,
        [
          { name: 'title', weight: 2.0, getValue: (b) => b.title },
          { name: 'description', weight: 1.5, getValue: (b) => b.description || '' },
          { name: 'author', weight: 1.5, getValue: (b) => b.author || '' },
          { name: 'class_level', weight: 1.5, getValue: (b) => b.class_level || '' },
          { name: 'board', weight: 1.5, getValue: (b) => b.board || '' },
          { name: 'subject', weight: 1.8, getValue: (b) => b.subject || '' },
          { name: 'category', weight: 1.5, getValue: (b) => b.category || '' },
          { name: 'condition', weight: 1.2, getValue: (b) => b.condition },
          { name: 'price', weight: 1.0, getValue: (b) => b.price?.toString() || '' },
          { name: 'price_status', weight: 1.0, getValue: (b) => b.price_status || '' },
          { name: 'location', weight: 1.0, getValue: (b) => b.location || '' },
          { name: 'city', weight: 1.0, getValue: (b) => b.city || '' },
          { name: 'year_of_publication', weight: 0.8, getValue: (b) => b.year_of_publication?.toString() || '' },
          { name: 'status', weight: 0.5, getValue: (b) => b.status },
          { name: 'seller_name', weight: 0.8, getValue: (b) => b.seller?.full_name || '' },
          { name: 'seller_location', weight: 0.8, getValue: (b) => b.seller?.location || '' },
          { name: 'created_at', weight: 0.3, getValue: (b) => new Date(b.created_at).toLocaleDateString() },
          { name: 'updated_at', weight: 0.3, getValue: (b) => new Date(b.updated_at).toLocaleDateString() }
        ],
        0.4
      );
      filteredData = results.map(r => r.item);
    } catch (err) {
      console.error('Error performing semantic search:', err);
      throw new Error('Search failed. Please try again.');
    }
  }

  // Calculate distances and sort by distance if needed
  if ((sort === 'distance_asc' || sort === 'distance_desc') && userLocation) {
    try {
      const [userLat, userLng] = userLocation.split(',').map(Number);
      
      if (!isNaN(userLat) && !isNaN(userLng)) {
        const booksWithDistance = await Promise.all(
          filteredData.map(async (book) => {
            try {
              let bookLat = 0;
              let bookLng = 0;

              if (book.coordinates) {
                const coords = typeof book.coordinates === 'string' 
                  ? JSON.parse(book.coordinates) 
                  : book.coordinates;
                bookLat = coords.latitude;
                bookLng = coords.longitude;
              } else if (book.location) {
                const [lat, lng] = book.location.split(',').map(Number);
                if (!isNaN(lat) && !isNaN(lng)) {
                  bookLat = lat;
                  bookLng = lng;
                } else {
                  // If location is not in coordinate format, try to geocode it
                  try {
                    const coords = await geocodeAddress(book.location);
                    bookLat = coords.latitude;
                    bookLng = coords.longitude;
                  } catch (error) {
                    console.warn(`Could not geocode location for book ${book.id}:`, error);
                    return { ...book, distance: Infinity };
                  }
                }
              }

              const distance = calculateDistance(userLat, userLng, bookLat, bookLng);
              return {
                ...book,
                distance: isNaN(distance) ? Infinity : distance
              };
            } catch (error) {
              console.warn(`Error calculating distance for book ${book.id}:`, error);
              return { ...book, distance: Infinity };
            }
          })
        );

        // Sort by distance
        filteredData = booksWithDistance.sort((a, b) => {
          const distA = a.distance || Infinity;
          const distB = b.distance || Infinity;
          return sort === 'distance_asc' ? distA - distB : distB - distA;
        });
      }
    } catch (error) {
      console.error('Error in distance calculation:', error);
      // If distance calculation fails, fall back to date sorting
      filteredData = filteredData.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
  }

  return {
    data: filteredData,
    total: count || filteredData.length,
  };
}

// Helper function to calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

export async function getBookById(id: string) {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw error;
  }

  return data as Book;
}

export async function createBook(bookData: Omit<Book, 'id' | 'created_at' | 'seller_id'>) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated to create a book');
  }

  const { data, error } = await supabase
    .from('books')
    .insert([
      {
        ...bookData,
        seller_id: user.id,
      }
    ])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as Book;
}

export async function deleteBook(id: string) {
  const { error } = await supabase
    .from('books')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }
}

export async function getRequests(params: URLSearchParams) {
  const query = params.get('q');
  const category = params.get('category');
  const board = params.get('board');
  const classLevel = params.get('class');
  const city = params.get('city');
  const priceStatus = params.get('priceStatus');
  const price = params.get('price');
  const condition = params.get('condition');
  const sort = params.get('sort') || 'newest';
  const page = parseInt(params.get('page') || '1');
  const limit = parseInt(params.get('limit') || '12');
  const location = params.get('location');
  const minPrice = params.get('minPrice');
  const maxPrice = params.get('maxPrice');

  // Get user's location from their profile if not provided in search params
  let userLocation = location;
  if (!userLocation) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('location')
        .eq('id', user.id)
        .single();
      if (profile?.location) {
        userLocation = profile.location;
      }
    }
  }

  let supabaseQuery = supabase
    .from('book_requests')
    .select('*, buyer:profiles(*)', { count: 'exact' });

  if (category) {
    supabaseQuery = supabaseQuery.eq('category', category);
  }

  if (board) {
    supabaseQuery = supabaseQuery.eq('board', board);
  }

  if (classLevel) {
    supabaseQuery = supabaseQuery.eq('class_level', classLevel);
  }

  if (city) {
    supabaseQuery = supabaseQuery.eq('location', city);
  }

  if (condition) {
    supabaseQuery = supabaseQuery.eq('condition', condition);
  }

  if (priceStatus === 'free') {
    supabaseQuery = supabaseQuery.eq('price', 0);
  } else if (priceStatus === 'paid') {
    supabaseQuery = supabaseQuery.gt('price', 0);
  }

  if (minPrice) {
    supabaseQuery = supabaseQuery.gte('price', parseFloat(minPrice));
  }

  if (maxPrice) {
    supabaseQuery = supabaseQuery.lte('price', parseFloat(maxPrice));
  }

  if (sort === 'price') {
    supabaseQuery = supabaseQuery.order('price', { ascending: true });
  } else if (sort === 'distance' && userLocation) {
    supabaseQuery = supabaseQuery.order('created_at', { ascending: false });
  } else if (sort === 'relevance') {
    supabaseQuery = supabaseQuery.order('created_at', { ascending: false });
  } else {
    supabaseQuery = supabaseQuery.order('created_at', { ascending: false });
  }

  if (query) {
    supabaseQuery = supabaseQuery.textSearch('title', query, {
      type: 'websearch',
      config: 'english',
    });
  }

  const { data, error, count } = await supabaseQuery
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    throw error;
  }

  // Calculate distances for all requests if we have user location
  let processedData = data;
  if (userLocation) {
    try {
      const [userLat, userLng] = userLocation.split(',').map(Number);
      
      if (isNaN(userLat) || isNaN(userLng)) {
        console.error('Invalid user location coordinates:', userLocation);
      } else {
        processedData = data?.map(item => {
          // Get coordinates from the request's location field
          const requestLocation = item.location;
          let requestLat = 0;
          let requestLng = 0;

          if (requestLocation) {
            const [lat, lng] = requestLocation.split(',').map(Number);
            if (!isNaN(lat) && !isNaN(lng)) {
              requestLat = lat;
              requestLng = lng;
            }
          }

          const distance = calculateDistance(
            userLat,
            userLng,
            requestLat,
            requestLng
          );

          return {
            ...item,
            distance: isNaN(distance) ? undefined : distance
          };
        });

        // Sort by distance if that's the selected sort option
        if (sort === 'distance') {
          processedData = processedData?.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
        }
      }
    } catch (error) {
      console.error('Error calculating distances:', error);
    }
  }

  return { 
    data: processedData, 
    total: count || 0 
  };
} 