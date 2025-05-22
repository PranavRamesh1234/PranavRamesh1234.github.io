-- Add images column to books table
ALTER TABLE public.books
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}'; 