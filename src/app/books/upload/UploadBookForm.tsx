'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LocationDetector from '@/components/LocationDetector';

export default function UploadBookForm() {
  const router = useRouter();
  const { user } = useAuth();
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);

  const handleLocationSelect = (location: string, coordinates: { latitude: number; longitude: number }) => {
    setLocation(location);
    setCoordinates(coordinates);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Upload Book</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">Add a new book to your listings.</p>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:px-6">
              <div className="space-y-6">
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Location
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Click on the map to select your location"
                      readOnly
                    />
                    <div className="mt-2">
                      <LocationDetector
                        onLocationSelect={handleLocationSelect}
                        mode="select"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 