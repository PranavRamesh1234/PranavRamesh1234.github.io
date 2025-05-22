'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';

// Dynamically import Leaflet with no SSR
const MapDialogContent = dynamic(() => import('./MapDialogContent'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
      <p className="text-gray-500 dark:text-gray-400">Loading map...</p>
    </div>
  ),
});

// Add type definitions for the geocoder
declare module 'leaflet' {
  namespace Control {
    interface GeocoderOptions {
      defaultMarkGeocode?: boolean;
      placeholder?: string;
      errorMessage?: string;
    }

    class Geocoder extends Control {
      constructor(options?: GeocoderOptions);
      on(event: string, handler: (e: { geocode: { bbox: L.LatLngBounds; center: L.LatLng; name: string } }) => void): this;
    }
  }
}

interface MapDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: { latitude: number; longitude: number; address: string }) => void;
  initialLocation?: { latitude: number; longitude: number };
}

export default function MapDialog({ isOpen, onClose, onLocationSelect, initialLocation }: MapDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
        
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Select Location
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Search for a general area or click on the map to select a location. 
              For privacy and accuracy, please use general area names (e.g., "Koramangala, Bangalore") 
              rather than specific addresses. You can add your detailed address in your profile settings.
            </p>
          </div>

          <div className="p-4">
            <MapDialogContent
              onLocationSelect={onLocationSelect}
              initialLocation={initialLocation}
              onClose={onClose}
            />
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 