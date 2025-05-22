-- Add year_of_publication column to books table
ALTER TABLE public.books
ADD COLUMN IF NOT EXISTS year_of_publication INTEGER; 