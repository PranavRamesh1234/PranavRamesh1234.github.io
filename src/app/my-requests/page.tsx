'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import RequestBookButton from '@/components/RequestBookButton';

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
}

export default function MyRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<BookRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('book_requests')
        .select('*')
        .eq('buyer_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError('Failed to load requests. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (requestId: string, newStatus: 'open' | 'fulfilled' | 'closed') => {
    try {
      const { error } = await supabase
        .from('book_requests')
        .update({ status: newStatus })
        .eq('id', requestId)
        .eq('buyer_id', user?.id);

      if (error) throw error;
      fetchRequests(); // Refresh the list
    } catch (err) {
      console.error('Error updating request status:', err);
      setError('Failed to update request status. Please try again later.');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Please sign in to view your requests
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              You need to be signed in to view and manage your book requests.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Book Requests
          </h1>
          <RequestBookButton variant="button" />
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-red-600 text-center py-8">{error}</div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              You haven't made any book requests yet.
            </p>
            <RequestBookButton variant="button" className="mx-auto" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {requests.map((request) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {request.title}
                    </h3>
                    {request.author && (
                      <p className="text-gray-600 dark:text-gray-300 mb-2">
                        Author: {request.author}
                      </p>
                    )}
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <p>Subject: {request.subject}</p>
                      <p>Class: {request.class}</p>
                      <p>Board: {request.board}</p>
                      <p>Condition: {request.condition}</p>
                      {request.location && <p>Location: {request.location}</p>}
                      {request.max_budget && <p>Max Budget: ₹{request.max_budget}</p>}
                    </div>
                    {request.notes && (
                      <p className="mt-4 text-gray-600 dark:text-gray-300">
                        Notes: {request.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end space-y-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      request.status === 'open'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : request.status === 'fulfilled'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                    {request.status === 'open' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleStatusChange(request.id, 'fulfilled')}
                          className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Mark as Fulfilled
                        </button>
                        <button
                          onClick={() => handleStatusChange(request.id, 'closed')}
                          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        >
                          Close Request
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                  Posted {new Date(request.created_at).toLocaleDateString()}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 