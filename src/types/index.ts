import { Category } from '@/lib/constants';

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  price: number | null;
  price_type: 'fixed' | 'negotiable' | 'price-on-call';
  category: Category;
  board?: 'CBSE' | 'ICSE' | 'State Board' | 'IB' | 'IGCSE' | 'Other';
  class_level?: string;
  subject?: string;
  condition: string;
  city: string;
  images: string[];
  status: 'available' | 'sold' | 'reserved';
  seller_id: string;
  created_at?: string;
  updated_at?: string;
  year_of_publication: number;
  location: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  tags: string[];
  distance?: number;
  seller?: {
    id: string;
    full_name: string;
    email: string;
    phone_number: string | null;
    location: string | null;
    avatar_url: string | null;
    created_at: string;
    updated_at: string;
  };
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone_number: string;
  location: string;
  coordinates: string | undefined;
  avatar_url: string;
  created_at: string;
  updated_at: string;
}

export interface Seller extends User {
  // Additional seller-specific fields can be added here
}

export interface BookFormData {
  title: string;
  author: string;
  description: string;
  price: number;
  condition: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
  images: File[];
  yearOfPublication: number;
  location: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  category: Category;
  board?: 'CBSE' | 'ICSE' | 'State Board' | 'IB' | 'IGCSE' | 'Other';
  class_level?: string;
  subject?: string;
  tags: string[];
  existingImages?: string[];
}

export interface GetBooksResponse {
  data: Book[];
  total: number;
}

export interface Request {
  id: string;
  title: string;
  author: string | null;
  description: string | null;
  price: number;
  condition: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
  year_of_publication: number | null;
  location: string | null;
  coordinates: { lat: number; lng: number } | null;
  category: string;
  board: string | null;
  class_level: string | null;
  subject: string | null;
  tags: string[];
  images: string[];
  status: 'available' | 'sold' | 'pending';
  created_at: string;
  updated_at: string;
  buyer: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    phone_number: string | null;
    email: string;
    location: string | null;
    created_at: string;
    updated_at: string;
  };
} 