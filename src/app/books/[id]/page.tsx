'use client';

import { useEffect, useState } from 'react';
import { getBook } from '@/lib/supabase-utils';
import { Book } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Seller {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  location: string | null;
}

export default function BookPage({ params }: { params: { id: string } }) {
  const [book, setBook] = useState<(Book & { seller: Seller }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const fetchedBook = await getBook(params.id);
        setBook(fetchedBook);
      } catch (err) {
        console.error('Error fetching book:', err);
        setError(err instanceof Error ? err.message : 'Failed to load book');
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [params.id]);

  const handlePreviousImage = () => {
    if (!book?.images) return;
    setCurrentImageIndex((prev) => (prev === 0 ? book.images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    if (!book?.images) return;
    setCurrentImageIndex((prev) => (prev === book.images.length - 1 ? 0 : prev + 1));
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error || 'Book Not Found'}
          </h1>
          <Link
            href="/books"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Back to Books
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            {/* Book Images */}
            <div className="space-y-4">
              {book.images && book.images.length > 0 ? (
                <div className="relative">
                  {/* Main Image */}
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg">
                    <Image
                      src={book.images[currentImageIndex]}
                      alt={book.title}
                      fill
                      className={`object-cover transition-transform duration-300 cursor-zoom-in ${
                        isZoomed ? 'scale-150' : 'scale-100'
                      }`}
                      onClick={toggleZoom}
                    />
                    <button
                      onClick={toggleZoom}
                      className="absolute bottom-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                    >
                      <MagnifyingGlassIcon className="h-6 w-6" />
                    </button>
                  </div>

                  {/* Navigation Buttons */}
                  {book.images.length > 1 && (
                    <>
                      <button
                        onClick={handlePreviousImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                      >
                        <ChevronLeftIcon className="h-6 w-6" />
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                      >
                        <ChevronRightIcon className="h-6 w-6" />
                      </button>
                    </>
                  )}

                  {/* Thumbnails */}
                  {book.images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2 mt-4">
                      {book.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => handleThumbnailClick(index)}
                          className={`relative aspect-square rounded-lg overflow-hidden ${
                            currentImageIndex === index
                              ? 'ring-2 ring-blue-500'
                              : 'opacity-70 hover:opacity-100'
                          }`}
                        >
                          <Image
                            src={image}
                            alt={`${book.title} - Thumbnail ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-[3/4] w-full bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 dark:text-gray-500">No image available</span>
                </div>
              )}
            </div>

            {/* Book Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{book.title}</h1>
                <p className="mt-2 text-xl text-gray-600 dark:text-gray-300">by {book.author}</p>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Price</dt>
                    <dd className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">₹{book.price}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Condition</dt>
                    <dd className="mt-1 text-lg text-gray-900 dark:text-white capitalize">{book.condition}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Year of Publication</dt>
                    <dd className="mt-1 text-lg text-gray-900 dark:text-white">{book.year_of_publication}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</dt>
                    <dd className="mt-1 text-lg text-gray-900 dark:text-white">{book.location}</dd>
                  </div>
                </dl>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Description</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{book.description}</p>
              </div>

              {/* Seller Information */}
              {book.seller && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Seller Information</h3>
                  <div className="mt-4 flex items-center space-x-4">
                    {book.seller.avatar_url ? (
                      <div className="relative h-12 w-12">
                        <Image
                          src={book.seller.avatar_url}
                          alt={book.seller.full_name || 'Seller'}
                          fill
                          className="rounded-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <span className="text-gray-500 dark:text-gray-400">
                          {(book.seller.full_name || book.seller.email || '?')[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {book.seller.full_name || 'Anonymous Seller'}
                      </p>
                      {book.seller.location && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">{book.seller.location}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 