import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the map component with no SSR
const MapWithNoSSR = dynamic(
  () => import('./MapComponent'),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 animate-pulse" />
    ),
  }
);

interface LocationDisplayProps {
  location: string;
  coordinates?: { latitude: number; longitude: number };
}

export default function LocationDisplay({ location, coordinates }: LocationDisplayProps) {
  // If we have a location string, show it
  if (location) {
    return (
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</div>
        <div className="text-sm text-gray-600 dark:text-gray-300">{location}</div>
        {coordinates && (
          <div className="mt-2">
            <MapWithNoSSR coordinates={coordinates} />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Note: Map location is approximate and may not always be accurate. Please contact the seller for exact meeting location.
            </p>
          </div>
        )}
      </div>
    );
  }

  // If we only have coordinates but no location string, show the map
  if (coordinates) {
    return (
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</div>
        <MapWithNoSSR coordinates={coordinates} />
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Note: Map location is approximate and may not always be accurate. Please contact the seller for exact meeting location.
        </p>
      </div>
    );
  }

  // If we have neither, show a placeholder
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</div>
      <div className="text-sm text-gray-600 dark:text-gray-300">No location available</div>
    </div>
  );
} 