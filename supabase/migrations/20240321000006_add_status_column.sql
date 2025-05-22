-- Add status column to books table
ALTER TABLE public.books
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'sold', 'pending')); 