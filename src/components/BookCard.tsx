import { Book } from '@/types';
import Image from 'next/image';
import Link from 'next/link';

interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
  const renderPrice = () => {
    if (book.price_status === 'price-on-call') {
      return (
        <div className="text-lg font-semibold text-gray-900 dark:text-white">
          Price on Call
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <div className="text-lg font-semibold text-gray-900 dark:text-white">
          ₹{book.price}
        </div>
        {book.price_status === 'negotiable' && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            (Negotiable)
          </span>
        )}
      </div>
    );
  };

  return (
    <Link href={`/books/${book.id}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="relative h-48">
          <Image
            src={book.images[0] || '/placeholder-book.jpg'}
            alt={book.title}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {book.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {book.author}
          </p>
          {renderPrice()}
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {book.condition}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              •
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {book.city}
            </span>
            {book.distance !== undefined && (
              <>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  •
                </span>
                <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  {book.distance < 1 
                    ? '< 1 km away' 
                    : `${Math.round(book.distance)} km away`}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
} 