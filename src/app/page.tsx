'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import FeaturedBooksSlider from '@/components/FeaturedBooksSlider';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Image from 'next/image';
import MeshGradientBackground from '@/components/MeshGradientBackground';
import { categories } from '@/lib/constants';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20
    }
  }
};

interface Book {
  id: string;
  title: string;
  author: string | null;
  images: string[];
  price: number;
  price_status: 'fixed' | 'price_on_call';
  class_level: string;
  board: string;
  subject: string;
  condition: string;
  seller: {
    id: string;
    full_name: string | null;
    email: string;
    location: string | null;
    created_at: string;
    updated_at: string;
  };
}

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedBooks = async () => {
      try {
        const { data, error } = await supabase
          .from('books')
          .select('*, seller:profiles(*)')
          .eq('status', 'available')
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;
        setFeaturedBooks(data || []);
      } catch (err) {
        console.error('Error fetching featured books:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedBooks();
  }, []);

  return (
    <div className="min-h-screen bg-[#020617]">
      <MeshGradientBackground>
        <div className="relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
              <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                <div className="sm:text-center lg:text-left">
                  <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
                    <span className="block">Find Your Next</span>
                    <span className="block text-[#00f2ff]">Book</span>
            </h1>
                  <p className="mt-3 text-base text-gray-300 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                    Buy and sell books with ease. Connect with fellow readers and find the perfect book for your needs.
            </p>
                  <div className="mt-6 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                    <div className="rounded-md shadow">
                <Link
                  href="/books"
                        className="w-full flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-md text-white bg-[#3D00B8] hover:bg-[#2D0088] md:py-4 md:text-lg md:px-10 transition-colors duration-300"
                >
                  Browse Books
                </Link>
                    </div>
                    <div className="mt-3 sm:mt-0 sm:ml-3">
                <Link
                        href="/requests"
                        className="w-full flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-md text-black bg-[#00ACB5] hover:bg-[#007b82] md:py-4 md:text-lg md:px-10 transition-all duration-300"
                >
                        View Requests
                </Link>
                    </div>
                  </div>
                </div>
              </main>
            </div>
          </div>
        </div>
      </MeshGradientBackground>

      {/* Featured Books Section */}
      <section className="pt-4 pb-8 bg-[#060013]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold text-white mt-4 mb-4"
          >
            Featured Books
          </motion.h2>
          <div className="scale-95 overflow-visible">
          <FeaturedBooksSlider />
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 bg-[#060013]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-center mb-8 text-white"
          >
            Browse by Category
          </motion.h2>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {categories.map((category) => (
              <motion.div
                key={category.value}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="bg-[#1F2937]/30 backdrop-blur-sm rounded-lg shadow-md p-6 text-center cursor-pointer hover:shadow-lg transition-all duration-300 hover:bg-[#2D3748]/40"
                onClick={() => router.push(`/books?category=${category.value}`)}
              >
                <h3 className="text-lg font-semibold text-white">{category.label}</h3>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
