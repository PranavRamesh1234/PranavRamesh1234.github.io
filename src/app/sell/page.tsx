'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BookUploadForm from '@/components/BookUploadForm';

export default function SellPage() {
  const router = useRouter();

  useEffect(() => {
    // Removed redirect logic
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            List Your Book
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Fill out the form below to list your book for sale.
          </p>
        </div>

        <div className="mt-12">
          <BookUploadForm />
        </div>
      </div>
    </div>
  );
} 