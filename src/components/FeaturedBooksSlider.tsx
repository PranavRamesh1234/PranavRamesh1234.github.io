'use client';

import { useEffect, useState } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import '@/styles/slider.css';
import { Book } from '@/types';
import { getBooks } from '@/lib/supabase-utils';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function FeaturedBooksSlider() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const data = await getBooks();
        setBooks(data.slice(0, 10)); // Get latest 10 books
      } catch (error) {
        console.error('Error fetching featured books:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 3,
        }
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          arrows: false,
        }
      }
    ]
  };

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="loading-spinner h-12 w-12"></div>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="w-full text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">No books available at the moment.</p>
      </div>
    );
  }

  return (
    <Slider {...settings}>
      {books.map((book) => (
        <div key={book.id} className="px-2">
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-lg shadow-lg p-4 h-full"
          >
            <Link href={`/books/${book.id}`}>
              <div className="aspect-[3/4] relative mb-4 overflow-hidden rounded-lg">
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                {book.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-1">
                {book.author}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  ${book.price.toFixed(2)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {book.condition}
                </span>
              </div>
            </Link>
          </motion.div>
        </div>
      ))}
    </Slider>
  );
} 