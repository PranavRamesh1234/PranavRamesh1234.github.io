-- Add location column to books table
ALTER TABLE books ADD COLUMN IF NOT EXISTS location TEXT;

-- Add coordinates column to books table
ALTER TABLE books ADD COLUMN IF NOT EXISTS coordinates JSONB;

-- Make board and class_level columns optional
ALTER TABLE books ALTER COLUMN board DROP NOT NULL;
ALTER TABLE books ALTER COLUMN class_level DROP NOT NULL;

-- Add subject column
ALTER TABLE books ADD COLUMN IF NOT EXISTS subject TEXT; 