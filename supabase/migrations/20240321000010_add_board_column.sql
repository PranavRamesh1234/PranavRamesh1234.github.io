-- Add board column to books table
ALTER TABLE public.books
ADD COLUMN IF NOT EXISTS board TEXT CHECK (board IN ('CBSE', 'ICSE', 'State Board', 'IB', 'IGCSE', 'Other')); 