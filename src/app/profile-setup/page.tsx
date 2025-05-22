'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

// Dynamically import LocationPicker to avoid SSR issues with Leaflet
const LocationPicker = dynamic(
  () => import('@/components/LocationPicker').then(mod => mod.default),
  {
    ssr: false,
    loading: () => <div className="h-[400px] bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" />
  }
);

interface Coordinates {
  lat: number;
  lng: number;
}

interface LocationData {
  lat: number;
  lng: number;
  address: string;
}

export default function ProfileSetupPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    location: '',
    coordinates: null as Coordinates | null,
    avatar_url: '',
  });

  useEffect(() => {
    if (!user) {
      router.push('/auth');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          ...formData,
          coordinates: formData.coordinates ? JSON.stringify(formData.coordinates) : null,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      // Get the stored redirect path or default to dashboard
      const redirectPath = localStorage.getItem('redirectPath') || '/profile';
      localStorage.removeItem('redirectPath'); // Clean up
      router.push(redirectPath);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (data: LocationData) => {
    setFormData(prev => ({
      ...prev,
      location: data.address,
      coordinates: { lat: data.lat, lng: data.lng }
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8"
        >
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Complete Your Profile
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="full_name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Full Name
              </label>
              <input
                type="text"
                id="full_name"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, full_name: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Location
              </label>
              <input
                type="text"
                id="location"
                value={formData.location}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, location: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Click on the map to select your location"
                readOnly
              />
              <div className="mt-2">
                <LocationPicker
                  onLocationSelect={handleLocationSelect}
                  selectedLocation={formData.location}
                  mode="select"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="avatar_url"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Profile Picture URL
              </label>
              <input
                type="url"
                id="avatar_url"
                value={formData.avatar_url}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, avatar_url: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="https://example.com/avatar.jpg"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Complete Setup'}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
} 