'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getBook } from '@/lib/supabase-utils';
import { Book } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import SellerInfoDialog from '@/components/SellerInfoDialog';
import { useAuth } from '@/contexts/AuthContext';
import AuthDialog from '@/components/AuthDialog';
import LocationDisplay from '@/components/LocationDisplay';
import { MapContainer as Map, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';

interface Seller {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
}

// Helper functions for academic book checks
const isAcademicBook = (category?: string) => {
  if (!category) return false;
  return ['school-textbooks', 'competitive-exams', 'engineering-medical', 'college-textbooks'].includes(category);
};

const needsBoardAndClass = (category?: string) => {
  if (!category) return false;
  return ['school-textbooks', 'competitive-exams', 'engineering-medical'].includes(category);
};

// Fix for default marker icon
const icon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

export default function BookDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const [book, setBook] = useState<Book & { seller: Seller } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showSellerInfo, setShowSellerInfo] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [pageData, setPageData] = useState<{
    bookId: string;
    currentImageIndex: number;
    isZoomed: boolean;
  } | null>(null);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const data = await getBook(params.id as string);
        setBook(data);
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

  const handleViewSellerInfo = () => {
    if (!user) {
      const newPageData = {
        bookId: params.id as string,
        currentImageIndex,
        isZoomed,
      };
      setPageData(newPageData);
      setShowAuthDialog(true);
      localStorage.setItem('pendingFormData', JSON.stringify(newPageData));
    } else {
      setShowSellerInfo(true);
    }
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-2 pb-6">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 p-4 sm:p-6">
            {/* Book Images */}
            <div className="space-y-3 max-w-lg mx-auto w-full">
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
                      className="absolute bottom-2 right-2 p-1.5 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                    >
                      <MagnifyingGlassIcon className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Navigation Buttons */}
                  {book.images.length > 1 && (
                    <>
                      <button
                        onClick={handlePreviousImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                      >
                        <ChevronLeftIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                      >
                        <ChevronRightIcon className="h-5 w-5" />
                      </button>
                    </>
                  )}

                  {/* Thumbnails */}
                  {book.images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2 mt-3">
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
            <div className="space-y-5">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{book.title}</h1>
                <p className="mt-1.5 text-lg sm:text-xl text-gray-600 dark:text-gray-300">by {book.author}</p>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-5">
                <dl className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Price</dt>
                    <dd className="mt-1.5 text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {book.price_type === 'price-on-call' ? 'Price on Call' : `₹${book.price}`}
                      {book.price_type === 'negotiable' && (
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">(Negotiable)</span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Condition</dt>
                    <dd className="mt-1.5 text-lg sm:text-xl text-gray-900 dark:text-white capitalize">{book.condition}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Year of Publication</dt>
                    <dd className="mt-1.5 text-lg sm:text-xl text-gray-900 dark:text-white">{book.year_of_publication}</dd>
                  </div>
                  <div>
                    <LocationDisplay 
                      location={book.location} 
                      coordinates={book.coordinates}
                    />
                  </div>
                </dl>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-5">
                <h3 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white">Description</h3>
                <p className="mt-2 text-base sm:text-lg text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{book.description}</p>
              </div>

              {book.category && (
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span>{book.category}</span>
                </div>
              )}

              {/* Academic Book Details */}
              {isAcademicBook(book.category) && (
                <div className="space-y-2">
                  {book.subject && (
                    <div className="flex items-center gap-2 text-sm text-white/70">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <span>Subject: {book.subject}</span>
                    </div>
                  )}
                  {needsBoardAndClass(book.category) && (
                    <>
                      {book.board && (
                        <div className="flex items-center gap-2 text-sm text-white/70">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span>Board: {book.board}</span>
                        </div>
                      )}
                      {book.class_level && (
                        <div className="flex items-center gap-2 text-sm text-white/70">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          <span>Class: {book.class_level}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleViewSellerInfo}
                className="w-full px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                View Seller Information
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {book && (
        <SellerInfoDialog
          isOpen={showSellerInfo}
          onClose={() => setShowSellerInfo(false)}
          seller={book.seller}
        />
      )}

      <AuthDialog
        isOpen={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
        formData={pageData || undefined}
      />
    </div>
  );
} 