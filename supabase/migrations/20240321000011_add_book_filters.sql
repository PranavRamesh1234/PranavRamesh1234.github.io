-- Add new filter columns to books table
ALTER TABLE books
ADD COLUMN IF NOT EXISTS class_level VARCHAR(10),
ADD COLUMN IF NOT EXISTS condition VARCHAR(20) CHECK (condition IN ('new', 'like-new', 'good', 'fair', 'poor')),
ADD COLUMN IF NOT EXISTS city VARCHAR(100);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_books_class_level ON books(class_level);
CREATE INDEX IF NOT EXISTS idx_books_condition ON books(condition);
CREATE INDEX IF NOT EXISTS idx_books_city ON books(city);

-- Update existing books with default values
UPDATE books
SET 
  class_level = 'Other',
  condition = 'good',
  city = 'Mumbai'
WHERE class_level IS NULL; 