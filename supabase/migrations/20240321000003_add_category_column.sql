-- Add category column to books table
ALTER TABLE public.books
ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'other' CHECK (category IN ('academic', 'fiction', 'non-fiction', 'textbook', 'reference', 'other')); 