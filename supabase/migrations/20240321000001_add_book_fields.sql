-- Add new columns to books table
ALTER TABLE public.books
ADD COLUMN IF NOT EXISTS year_of_publication INTEGER,
ADD COLUMN IF NOT EXISTS condition TEXT CHECK (condition IN ('new', 'like-new', 'good', 'fair', 'poor')),
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS location TEXT; 