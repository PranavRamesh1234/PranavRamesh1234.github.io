-- Add tags column to books table
ALTER TABLE public.books
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'; 