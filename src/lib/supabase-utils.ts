import { supabase } from './supabase';
import { Book, BookFormData } from '@/types';
import { useState } from 'react';

export const searchBooks = async (query: string) => {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .or(`title.ilike.%${query}%,author.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Book[];
};

export const addBook = async (bookData: BookFormData, sellerId: string) => {
  try {
    // First, upload images to storage
    const imageUrls: string[] = [];
    for (const image of bookData.images) {
      const fileExt = image.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${sellerId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('book-images')
        .upload(filePath, image);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('book-images')
        .getPublicUrl(filePath);

      imageUrls.push(publicUrl);
    }

    // Then, insert the book data
    const { data, error } = await supabase
      .from('books')
      .insert([
        {
          title: bookData.title,
          author: bookData.author,
          description: bookData.description,
          price: bookData.price,
          condition: bookData.condition,
          year_of_publication: bookData.yearOfPublication,
          location: bookData.location,
          category: bookData.category,
          tags: bookData.tags,
          images: imageUrls,
          seller_id: sellerId,
          status: 'available',
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data as Book;
  } catch (error) {
    console.error('Error in addBook:', error);
    throw error;
  }
};

export const getBook = async (id: string) => {
  console.log('Fetching book with ID:', id);
  try {
    const { data, error } = await supabase
      .from('books')
      .select(`
        *,
        seller:profiles!books_seller_id_fkey (
          id,
          email,
          full_name,
          location,
          phone_number,
          avatar_url
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    if (!data) {
      console.error('No book found with ID:', id);
      throw new Error('Book not found');
    }

    console.log('Book data:', data);
    return data as Book & { seller: any };
  } catch (error) {
    console.error('Error in getBook:', error);
    throw error;
  }
};

export const updateBook = async (id: string, bookData: Partial<BookFormData>) => {
  console.log('Updating book with data:', bookData);
  
  // Remove any fields that shouldn't be updated
  const { images, existingImages, yearOfPublication, ...updateData } = bookData;
  
  // Create the final update data with correct field names
  const finalUpdateData: Partial<Book> = {
    ...updateData,
    year_of_publication: yearOfPublication,
  };
  
  // If there are new images, handle them
  if (images && images.length > 0) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User must be authenticated to update book images');
    
    const imageUrls: string[] = [];
    for (const image of images) {
      const fileExt = image.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('book-images')
        .upload(filePath, image);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('book-images')
        .getPublicUrl(filePath);

      imageUrls.push(publicUrl);
    }

    // Combine existing and new images
    finalUpdateData.images = [...(existingImages || []), ...imageUrls];
  }

  const { data, error } = await supabase
    .from('books')
    .update(finalUpdateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating book:', error);
    throw error;
  }
  
  return data as Book;
};

export const getSellerBooks = async (sellerId: string) => {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Book[];
};

export async function getBooks(searchParams?: URLSearchParams) {
  try {
    let query = supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply search filter if query parameter exists
    const searchQuery = searchParams?.get('q');
    if (searchQuery) {
      query = query.or(`title.ilike.%${searchQuery}%,author.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
    }

    // Apply category filter if category parameter exists
    const category = searchParams?.get('category');
    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching books:', error);
    throw error;
  }
}

export async function getBookById(id: string) {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw error;
  }

  return data as Book;
}

export async function createBook(bookData: Omit<Book, 'id' | 'created_at' | 'seller_id'>) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated to create a book');
  }

  const { data, error } = await supabase
    .from('books')
    .insert([
      {
        ...bookData,
        seller_id: user.id,
      }
    ])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as Book;
}

export async function deleteBook(id: string) {
  const { error } = await supabase
    .from('books')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }
} 