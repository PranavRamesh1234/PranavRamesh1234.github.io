'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Book } from '@/types';
import { getSellerBooks } from '@/lib/supabase-utils';
import Link from 'next/link';

interface Profile {
  id: string;
  display_name: string;
  location: string;
  phone_number: string;
  email: string;
  photo_url?: string;
  created_at: string;
  updated_at: string;
}

export default function ProfilePage({ params }: { params: { id: string } }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, display_name, location, phone_number, email, photo_url, created_at, updated_at')
          .eq('id', params.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Error loading profile');
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error || 'Profile not found'}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            {profile.photo_url ? (
              <img
                src={profile.photo_url}
                alt={profile.display_name}
                className="h-16 w-16 rounded-full"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-2xl text-gray-500">
                  {profile.display_name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{profile.display_name}</h2>
              {profile.location && (
                <p className="text-sm text-gray-500">{profile.location}</p>
              )}
            </div>
          </div>
        </div>

        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
          <div className="mt-2 space-y-2">
            {profile.email && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Email:</span> {profile.email}
              </p>
            )}
          </div>
        </div>

        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Member Since</h3>
          <p className="text-sm text-gray-600">
            {new Date(profile.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
} 