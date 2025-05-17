'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Book } from '@/types';
import { getBooks } from '@/lib/supabase-utils';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import { motion } from 'framer-motion';

function BooksContent() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const category = searchParams.get('category');

  const fetchBooks = async (query?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (query) {
        params.set('q', query);
      }
      if (category) {
        params.set('category', category);
      }
      const data = await getBooks(params);
      setBooks(data);
    } catch (err) {
      console.error('Error fetching books:', err);
      setError('Failed to load books. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
    }
    fetchBooks(query || undefined);
  }, [category]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    fetchBooks(query);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {category 
                ? `${category.charAt(0).toUpperCase()}${category.slice(1)} Books`
                : 'Available Books'}
            </h1>
            {user && (
              <Link
                href="/sell"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Sell a Book
              </Link>
            )}
          </div>

          <div className="flex justify-center">
            <SearchBar 
              category={category || undefined} 
              onSearch={handleSearch}
              initialQuery={searchQuery}
            />
          </div>

          {error ? (
            <div className="text-center text-red-600 dark:text-red-400">{error}</div>
          ) : (
            <div className="relative">
              {loading && (
                <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm z-10 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              )}
              
              {books.length === 0 ? (
                <div className="text-center py-12">
                  {category ? (
                    <div className="space-y-4">
                      <p className="text-gray-500 dark:text-gray-400 text-lg">
                        No books available in the {category} category at the moment.
                      </p>
                      <p className="text-gray-500 dark:text-gray-400">
                        Would you like to browse all available books instead?
                      </p>
                      <Link
                        href="/books"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                      >
                        Browse All Books
                      </Link>
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">No books available at the moment.</p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {books.map((book) => (
                    <motion.div
                      key={book.id}
                      whileHover={{ y: -5 }}
                      className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-lg shadow-lg"
                    >
                      <Link href={`/books/${book.id}`}>
                        <div className="aspect-[4/3] relative overflow-hidden rounded-t-lg">
                          {book.images && book.images.length > 0 ? (
                            <img
                              src={book.images[0]}
                              alt={book.title}
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                              <span className="text-gray-400 dark:text-gray-500">No image</span>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                            {book.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-1">
                            {book.author}
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                              ₹{book.price}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              book.status === 'available' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                            }`}>
                              {book.status}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BooksPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    }>
      <BooksContent />
    </Suspense>
  );
} 