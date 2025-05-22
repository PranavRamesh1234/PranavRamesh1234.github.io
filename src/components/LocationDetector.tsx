'use client';

import { useState } from 'react';
import MapDialog from './MapDialog';
import { getCurrentLocation } from '@/utils/location';
import { Loader2 } from 'lucide-react';

interface LocationDetectorProps {
  onLocationSelect: (location: string, coordinates: { latitude: number; longitude: number }) => void;
  initialLocation?: string;
  initialCoordinates?: { latitude: number; longitude: number };
  mode?: 'display' | 'select';
}

export default function LocationDetector({
  onLocationSelect,
  initialLocation,
  initialCoordinates,
  mode = 'select'
}: LocationDetectorProps) {
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState<string | null>(null);
  const [detectedCoordinates, setDetectedCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const detectLocation = async () => {
    setIsDetecting(true);
    setError(null);
    try {
      const { locationString, coordinates } = await getCurrentLocation();
      setDetectedLocation(locationString);
      setDetectedCoordinates(coordinates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to detect location');
      setDetectedLocation(null);
      setDetectedCoordinates(null);
    } finally {
      setIsDetecting(false);
    }
  };

  const handleMapSelect = (location: { latitude: number; longitude: number; address: string }) => {
    setDetectedLocation(location.address);
    setDetectedCoordinates({ latitude: location.latitude, longitude: location.longitude });
  };

  const handleConfirm = () => {
    if (detectedLocation && detectedCoordinates) {
      setIsConfirming(true);
      onLocationSelect(detectedLocation, detectedCoordinates);
      setShowMap(false);
      setIsConfirming(false);
    }
  };

  const handleCancel = () => {
    setDetectedLocation(null);
    setDetectedCoordinates(null);
    setShowMap(false);
    setError(null);
  };

  if (mode === 'display') {
    return (
      <div className="text-sm text-muted-foreground">
        {initialLocation || 'No location set'}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="text-sm text-red-500">
          {error}
        </div>
      )}
      
      {detectedLocation ? (
        <div className="space-y-2">
          <div className="text-sm">
            Selected location: {detectedLocation}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowMap(true)}
              disabled={isConfirming}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Change Location
            </button>
            <button
              onClick={handleConfirm}
              disabled={isConfirming}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isConfirming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                  Confirming...
                </>
              ) : (
                'Confirm Location'
              )}
            </button>
            <button
              onClick={handleCancel}
              disabled={isConfirming}
              className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <button
            onClick={detectLocation}
            disabled={isDetecting}
            className="w-full px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDetecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                Detecting Location...
              </>
            ) : (
              'Detect My Location'
            )}
          </button>
          <button
            onClick={() => setShowMap(true)}
            className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100"
          >
            Pick on Map
          </button>
        </div>
      )}

      <MapDialog
        isOpen={showMap}
        onClose={() => setShowMap(false)}
        onLocationSelect={handleMapSelect}
        initialLocation={detectedCoordinates || initialCoordinates}
      />
    </div>
  );
} 