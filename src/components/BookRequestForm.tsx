'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import MapDialog from './MapDialog';

const subjects = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'History',
  'Geography',
  'Economics',
  'Computer Science',
  'Other'
];

const classes = [
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
  'Class 11', 'Class 12', 'College', 'Other'
];

const boards = [
  'CBSE',
  'ICSE',
  'State Board',
  'IB',
  'IGCSE',
  'Other'
];

const conditions = [
  'New',
  'Like New',
  'Good',
  'Fair',
  'Any'
];

export default function BookRequestForm() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState<{ latitude: number; longitude: number; address: string } | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    subject: '',
    class: '',
    board: '',
    location: '',
    max_budget: '',
    condition: 'Any',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!user) {
        throw new Error('Please sign in to request a book');
      }

      const { error: submitError } = await supabase
        .from('book_requests')
        .insert([
          {
            buyer_id: user.id,
            ...formData,
            max_budget: formData.max_budget ? parseFloat(formData.max_budget) : null
          }
        ]);

      if (submitError) throw submitError;

      setSuccess(true);
      setFormData({
        title: '',
        author: '',
        subject: '',
        class: '',
        board: '',
        location: '',
        max_budget: '',
        condition: 'Any',
        notes: ''
      });

      // Redirect to requests page after 2 seconds
      setTimeout(() => {
        router.push('/requests');
      }, 2000);

    } catch (err) {
      console.error('Error submitting request:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLocationSelect = (location: { latitude: number; longitude: number; address: string }) => {
    setSelectedCoordinates(location);
    setFormData(prev => ({
      ...prev,
      location: location.address
    }));
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="text-green-600 text-xl mb-4">✅ Your request is now live!</div>
        <p className="text-gray-600">We'll notify you if someone has it.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          📖 Book Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          value={formData.title}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
        />
      </div>

      <div>
        <label htmlFor="author" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          ✍️ Author (Optional)
        </label>
        <input
          type="text"
          id="author"
          name="author"
          value={formData.author}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
        />
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          📚 Subject/Category *
        </label>
        <select
          id="subject"
          name="subject"
          required
          value={formData.subject}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
        >
          <option value="">Select a subject</option>
          {subjects.map(subject => (
            <option key={subject} value={subject}>{subject}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="class" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          🎓 Class/Grade *
        </label>
        <select
          id="class"
          name="class"
          required
          value={formData.class}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
        >
          <option value="">Select a class</option>
          {classes.map(cls => (
            <option key={cls} value={cls}>{cls}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="board" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          🏫 Board *
        </label>
        <select
          id="board"
          name="board"
          required
          value={formData.board}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
        >
          <option value="">Select a board</option>
          {boards.map(board => (
            <option key={board} value={board}>{board}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          📍 Location (Optional)
        </label>
        <div className="mt-1 flex">
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="flex-1 rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
            placeholder="Enter your location"
          />
          <button
            type="button"
            onClick={() => setIsMapOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="max_budget" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          💵 Max Budget (Optional)
        </label>
        <input
          type="number"
          id="max_budget"
          name="max_budget"
          min="0"
          step="0.01"
          value={formData.max_budget}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
        />
      </div>

      <div>
        <label htmlFor="condition" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          📦 Condition *
        </label>
        <select
          id="condition"
          name="condition"
          required
          value={formData.condition}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
        >
          {conditions.map(condition => (
            <option key={condition} value={condition}>{condition}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          📝 Additional Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          value={formData.notes}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
          placeholder="e.g., Need it within a week, or Prefer handwritten notes"
        />
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </div>

      <MapDialog
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onLocationSelect={handleLocationSelect}
        initialLocation={selectedCoordinates || undefined}
      />
    </form>
  );
} 