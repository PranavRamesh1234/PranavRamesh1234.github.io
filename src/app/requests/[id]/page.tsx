'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import BuyerInfoDialog from '@/components/BuyerInfoDialog';

interface BookRequest {
  id: string;
  title: string;
  author: string | null;
  subject: string;
  class: string;
  board: string;
  location: string | null;
  max_budget: number | null;
  condition: string;
  notes: string | null;
  status: 'open' | 'fulfilled' | 'closed';
  created_at: string;
  updated_at: string;
  buyer_name: string;
  buyer_email: string;
  buyer_id: string;
}

export default function RequestDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [request, setRequest] = useState<BookRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBuyer, setSelectedBuyer] = useState<{
    id: string;
    full_name: string | null;
    email: string;
    location: string | null;
    created_at: string;
    updated_at: string;
  } | null>(null);

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const fetchRequest = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('book_requests_with_buyer')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setRequest(data);
    } catch (err) {
      console.error('Error fetching request:', err);
      setError('Failed to load request details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Please sign in to view request details
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              You need to be signed in to view and respond to book requests.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {error || 'Request not found'}
            </h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8"
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {request.title}
            </h1>
            {request.author && (
              <p className="text-xl text-gray-600 dark:text-gray-300">
                by {request.author}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Book Details
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Subject</p>
                  <p className="text-gray-900 dark:text-white">{request.subject}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Class</p>
                  <p className="text-gray-900 dark:text-white">{request.class}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Board</p>
                  <p className="text-gray-900 dark:text-white">{request.board}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Condition Required</p>
                  <p className="text-gray-900 dark:text-white">{request.condition}</p>
                </div>
                {request.max_budget && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Maximum Budget</p>
                    <p className="text-gray-900 dark:text-white">₹{request.max_budget}</p>
                  </div>
                )}
                {request.location && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Preferred Location</p>
                    <p className="text-gray-900 dark:text-white">{request.location}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Buyer Information
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                  <p className="text-gray-900 dark:text-white">{request.buyer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Posted On</p>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(request.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedBuyer({
                    id: request.buyer_id,
                    full_name: request.buyer_name,
                    email: request.buyer_email,
                    location: null,
                    created_at: request.created_at,
                    updated_at: request.updated_at
                  })}
                  className="mt-4 px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors duration-200"
                >
                  Contact Buyer
                </button>
              </div>
            </div>
          </div>

          {request.notes && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Additional Notes
              </h2>
              <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                {request.notes}
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {selectedBuyer && (
        <BuyerInfoDialog
          isOpen={!!selectedBuyer}
          onClose={() => setSelectedBuyer(null)}
          buyer={selectedBuyer}
        />
      )}
    </div>
  );
} 