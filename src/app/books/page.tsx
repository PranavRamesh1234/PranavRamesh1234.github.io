'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getBooks } from '@/lib/supabase-utils';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import SearchFilters from '@/components/SearchFilters';
import { motion } from 'framer-motion';
import RequestBookButton from '@/components/RequestBookButton';
import Pagination from '@/components/Pagination';
import { FaSearch, FaSort } from 'react-icons/fa';
import { getCurrentLocation, calculateDistance } from '@/utils/location';
import BookCard from '@/components/BookCard';

interface Book {
  id: string;
  title: string;
  author: string;
  price: number | null;
  condition: string;
  location: string;
  imageUrl?: string;
  distance?: number;
  category?: string;
  board?: string;
  classLevel?: string;
  priceStatus?: string;
  images: string[];
  seller?: {
    id: string;
    full_name: string;
    email: string;
    phone_number: string | null;
    location: string | null;
    avatar_url: string | null;
    created_at: string;
    updated_at: string;
  };
  price_type: 'fixed' | 'negotiable' | 'price-on-call';
  status: 'available' | 'sold' | 'reserved';
  created_at?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  description: string;
  city: string;
  seller_id: string;
  year_of_publication: number;
  tags: string[];
}

interface SearchFilters {
  category: string;
  board: string;
  classLevel: string;
  condition: string;
  priceStatus: string;
  location: string | null;
  minPrice?: string;
  maxPrice?: string;
}

function getTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
}

function BooksContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [userLocation, setUserLocation] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('relevance');

  const initialFilters = {
    category: searchParams.get('category') || '',
    board: searchParams.get('board') || '',
    classLevel: searchParams.get('class') || '',
    condition: searchParams.get('condition') || '',
    priceStatus: searchParams.get('priceStatus') || '',
    location: searchParams.get('location') || null,
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
  };

  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const hasActiveFilters = Object.values(filters).some(value => value !== '' && value !== undefined);
  const ITEMS_PER_PAGE = 4;

  const fetchBooks = async (query?: string, page: number = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      // Add all parameters from searchParams
      if (query) params.set('q', query);
      if (searchParams.get('category')) params.set('category', searchParams.get('category')!);
      if (searchParams.get('board')) params.set('board', searchParams.get('board')!);
      if (searchParams.get('class')) params.set('class', searchParams.get('class')!);
      if (searchParams.get('city')) params.set('city', searchParams.get('city')!);
      if (searchParams.get('minPrice')) params.set('minPrice', searchParams.get('minPrice')!);
      if (searchParams.get('maxPrice')) params.set('maxPrice', searchParams.get('maxPrice')!);
      if (searchParams.get('condition')) params.set('condition', searchParams.get('condition')!);
      if (filters.location) params.set('location', filters.location);
      
      // Add sorting parameter
      params.set('sort', sortBy);
      
      params.set('page', page.toString());
      params.set('limit', ITEMS_PER_PAGE.toString());
      
      const { data, total } = await getBooks(params);
      setBooks(data);
      setTotalResults(total);
      setTotalPages(Math.ceil(total / ITEMS_PER_PAGE));
    } catch (err) {
      console.error('Error fetching books:', err);
      setError('Failed to load books. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const query = searchParams.get('q');
    const sort = searchParams.get('sort') || 'relevance';
    setSortBy(sort);
    fetchBooks(query || undefined, currentPage);
  }, [searchParams, currentPage, sortBy]);

  useEffect(() => {
    const getUserLocation = async () => {
      try {
        const location = await getCurrentLocation();
        setUserLocation(location.locationString);
      } catch (err) {
        console.error('Error getting user location:', err);
      }
    };

    getUserLocation();
  }, []);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const calculateDistances = async () => {
      if (!userLocation || books.length === 0) {
        setFilteredBooks(books);
        return;
      }

      try {
        const booksWithDistance = await Promise.all(
          books.map(async (book) => {
            try {
              const distance = await calculateDistance(
                userLocation,
                book.location,
                undefined,
                book.coordinates ? JSON.stringify(book.coordinates) : undefined
              );
              return {
                ...book,
                distance: distance === Infinity ? undefined : distance
              };
            } catch (error) {
              console.error('Error calculating distance for book:', book.id, error);
              return {
                ...book,
                distance: undefined
              };
            }
          })
        );
        
        if (isMounted) {
          setFilteredBooks(booksWithDistance);
        }
      } catch (error) {
        console.error('Error calculating distances:', error);
        setFilteredBooks(books);
      }
    };

    // Debounce the distance calculations
    timeoutId = setTimeout(calculateDistances, 500);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [books, userLocation]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const params = new URLSearchParams(searchParams.toString());
    params.set('q', query);
    router.push(`/books?${params.toString()}`);
  };

  const handleFilterChange = async (newFilters: SearchFilters) => {
    setFilters(newFilters);
    const params = new URLSearchParams(searchParams.toString());
    
    // Update URL parameters
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    
    router.push(`/books?${params.toString()}`);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', sort);
    router.push(`/books?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/books?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#020617]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Browse Books</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl hover:border-[#00f2ff]/40 transition-all duration-300">
              <SearchFilters
                onFilterChange={handleFilterChange}
                onSortChange={handleSortChange}
                initialFilters={filters}
                initialSort={sortBy}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="flex flex-col items-center mb-8">
              <div className="w-full max-w-2xl">
                <SearchBar onSearch={handleSearch} initialQuery={searchQuery} />
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <div className="text-gray-300">
                {totalResults} {totalResults === 1 ? 'book' : 'books'} found
              </div>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="w-48 px-3 py-2 bg-[#1E293B] border border-white/20 rounded-md text-white focus:ring-2 focus:ring-[#00f2ff] focus:border-[#00f2ff]"
              >
                <option value="relevance" className="bg-[#1E293B] text-white">Most Relevant</option>
                <option value="price_asc" className="bg-[#1E293B] text-white">Lowest Price</option>
                <option value="price_desc" className="bg-[#1E293B] text-white">Highest Price</option>
                <option value="date_desc" className="bg-[#1E293B] text-white">Newest First</option>
                <option value="date_asc" className="bg-[#1E293B] text-white">Oldest First</option>
              </select>
            </div>

            {/* Books Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 animate-pulse">
                    <div className="h-48 bg-gray-800/50 rounded-md mb-4"></div>
                    <div className="h-4 bg-gray-800/50 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-800/50 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-red-400 text-center py-8">{error}</div>
            ) : filteredBooks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-300 mb-4">No books found matching your criteria.</p>
                <RequestBookButton variant="button" className="mx-auto" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                {filteredBooks.map((book) => (
                  <motion.div
                    key={book.id}
                    whileHover={{ y: -5 }}
                    className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-2xl hover:border-[#00f2ff]/40 transition-all duration-300 cursor-pointer flex flex-col"
                    onClick={() => router.push(`/books/${book.id}`)}
                  >
                    <div className="aspect-[4/3] relative overflow-hidden rounded-t-lg">
                      {book.images && book.images.length > 0 ? (
                        <img
                          src={book.images[0]}
                          alt={book.title}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-800/50 flex items-center justify-center">
                          <span className="text-gray-400">No image</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex-grow flex flex-col">
                      <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                        {book.title}
                      </h3>
                      <p className="text-sm text-gray-300 mb-2 line-clamp-1">
                        {book.author}
                      </p>
                      <div className="flex justify-between items-center mt-auto">
                        <span className="text-lg font-bold text-[#00f2ff]">
                          {book.price_type === 'price-on-call' ? 'Price on Call' : 
                           book.price_type === 'negotiable' ? `₹${book.price} (Negotiable)` :
                           `₹${book.price}`}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          book.status === 'available' 
                            ? 'bg-[#00f2ff]/20 text-[#00f2ff]' 
                            : book.status === 'sold' ? 'bg-gray-800/50 text-gray-400' : 'bg-gray-800/50 text-gray-400'
                        }`}>
                          {book.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-gray-400">
                          Posted {getTimeAgo(book.created_at || '')}
                        </p>
                        {book.distance !== undefined && book.distance !== Infinity && (
                          <p className="text-xs text-[#00f2ff]">
                            {book.distance < 1 
                              ? `${Math.round(book.distance * 1000)}m away`
                              : `${book.distance.toFixed(1)}km away`}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BooksPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BooksContent />
    </Suspense>
  );
} 