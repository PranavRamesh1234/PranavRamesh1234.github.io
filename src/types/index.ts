export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  price: number;
  condition: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
  images: string[];
  year_of_publication: number;
  location: string;
  category: 'academic' | 'fiction' | 'non-fiction' | 'textbook' | 'reference' | 'other';
  tags: string[];
  seller_id: string;
  status: 'available' | 'sold' | 'pending';
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  phone_number?: string;
  location?: string;
  created_at: string;
  updated_at: string;
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
  category: 'academic' | 'fiction' | 'non-fiction' | 'textbook' | 'reference' | 'other';
  tags: string[];
  existingImages?: string[];
} 