'use client';

import { useRouter } from 'next/navigation';
import BookUploadForm from '@/components/BookUploadForm';

export default function SellPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#020617]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">List Your Book</h1>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl hover:border-[#00f2ff]/40 transition-all duration-300">
          <BookUploadForm />
        </div>
      </div>
    </div>
  );
} 