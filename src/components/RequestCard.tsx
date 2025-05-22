import { Request } from '@/types';
import Link from 'next/link';
import { motion } from 'framer-motion';
import BuyerInfoDialog from './BuyerInfoDialog';
import { useState } from 'react';

interface RequestCardProps {
  request: Request & { distance?: number };
}

export default function RequestCard({ request }: RequestCardProps) {
  const [selectedBuyer, setSelectedBuyer] = useState<Request['buyer'] | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-md overflow-hidden"
    >
      <Link href={`/requests/${request.id}`} className="block p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{request.title}</h3>
        <p className="text-gray-600 mb-4">{request.author}</p>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Subject</p>
            <p className="text-gray-900">{request.subject}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Class Level</p>
            <p className="text-gray-900">{request.class_level}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Board</p>
            <p className="text-gray-900">{request.board}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Condition</p>
            <p className="text-gray-900">{request.condition}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Location</p>
            <p className="text-gray-900">{request.location}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Price</p>
            <p className="text-gray-900">₹{request.price}</p>
          </div>
          {request.distance !== undefined && (
            <div>
              <p className="text-sm text-gray-500">Distance</p>
              <p className="text-gray-900">{request.distance.toFixed(1)} km</p>
            </div>
          )}
        </div>
      </Link>
      
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Posted {new Date(request.created_at).toLocaleDateString()}</p>
            <p className="text-sm text-gray-900">{request.buyer.full_name}</p>
          </div>
          <div className="flex space-x-2">
            <Link
              href={`/requests/${request.id}`}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              View Details
            </Link>
            <button
              onClick={() => setSelectedBuyer(request.buyer)}
              className="px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50"
            >
              Contact Buyer
            </button>
          </div>
        </div>
      </div>

      {selectedBuyer && (
        <BuyerInfoDialog
          buyer={selectedBuyer}
          onClose={() => setSelectedBuyer(null)}
          isOpen={!!selectedBuyer}
        />
      )}
    </motion.div>
  );
} 