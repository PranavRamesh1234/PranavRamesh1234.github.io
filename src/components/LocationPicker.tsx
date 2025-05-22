import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in Next.js
const defaultIcon = L.icon({
  iconUrl: '/images/marker-icon.png',
  iconRetinaUrl: '/images/marker-icon-2x.png',
  shadowUrl: '/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = defaultIcon;

interface Coordinates {
  lat: number;
  lng: number;
}

interface LocationPickerProps {
  onLocationSelect: (data: { lat: number; lng: number; address: string }) => void;
  initialLocation?: Coordinates;
}

function LocationMarker({ onLocationSelect }: { onLocationSelect: (data: { lat: number; lng: number; address: string }) => void }) {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      // Reverse geocode to get address
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}`)
        .then(response => response.json())
        .then(data => {
          onLocationSelect({
            lat: e.latlng.lat,
            lng: e.latlng.lng,
            address: data.display_name
          });
        })
        .catch(error => {
          console.error('Error fetching address:', error);
          onLocationSelect({
            lat: e.latlng.lat,
            lng: e.latlng.lng,
            address: `${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}`
          });
        });
    },
  });

  return position === null ? null : (
    <Marker position={position} />
  );
}

export default function LocationPicker({ onLocationSelect, initialLocation }: LocationPickerProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="h-[400px] bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" />;
  }

  const defaultCenter = initialLocation || { lat: 13.0827, lng: 80.2707 }; // Chennai coordinates

  return (
    <div className="h-[400px] rounded-lg overflow-hidden">
      <MapContainer
        center={[defaultCenter.lat, defaultCenter.lng]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <LocationMarker onLocationSelect={onLocationSelect} />
        {initialLocation && <Marker position={[initialLocation.lat, initialLocation.lng]} />}
      </MapContainer>
    </div>
  );
} 