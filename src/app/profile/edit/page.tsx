'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import PhoneNumberInput from '@/components/PhoneNumberInput';
import dynamic from 'next/dynamic';
import LocationDetector from '@/components/LocationDetector';

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

export default function EditProfilePage() {
  const router = useRouter();
  const { user, updateProfile: updateUserProfile } = useAuth();
  const [fullName, setFullName] = useState<string>(user?.full_name ?? '');
  const [phoneNumber, setPhoneNumber] = useState<string>(user?.phone_number ?? '');
  const [location, setLocation] = useState(user?.location || '');
  const [coordinates, setCoordinates] = useState<Coordinates | undefined>(
    user?.coordinates ? JSON.parse(user.coordinates) : undefined
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(user?.avatar_url ?? undefined);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/auth');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(undefined);

    const updateData = {
      full_name: fullName,
      phone_number: phoneNumber,
      location: location,
      coordinates: coordinates ? JSON.stringify(coordinates) : undefined,
      avatar_url: avatarUrl ?? undefined,
    };

    console.log('Sending update data:', updateData);

    try {
      await updateUserProfile(updateData);
      router.push('/profile');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
    } catch (error) {
      console.error('Error uploading avatar:', error);
    } finally {
      setUploading(false);
    }
  }

  const handleLocationSelect = (data: LocationData) => {
    setCoordinates({ lat: data.lat, lng: data.lng });
    setLocation(data.address);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Edit Profile</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">Update your personal information.</p>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:px-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <div className="mt-1">
                    <input
                      type="email"
                      id="email"
                      value={user.email}
                      disabled
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Full Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone Number
                  </label>
                  <PhoneNumberInput
                    value={phoneNumber}
                    onChange={setPhoneNumber}
                    required
                    error={error}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

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
                        selectedLocation={location}
                        mode="select"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Profile Picture</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={uploadAvatar}
                    disabled={uploading}
                    className="mt-1 block w-full"
                  />
                  {avatarUrl && (
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className="mt-2 h-20 w-20 rounded-full object-cover"
                    />
                  )}
                </div>

                {error && (
                  <div className="text-red-500 dark:text-red-400 text-sm">{error}</div>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => router.push('/profile')}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 