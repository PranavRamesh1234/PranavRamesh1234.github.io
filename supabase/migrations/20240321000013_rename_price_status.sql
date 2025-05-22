-- Add price_type column to books table
ALTER TABLE books
ADD COLUMN IF NOT EXISTS price_type TEXT NOT NULL DEFAULT 'fixed' 
CHECK (price_type IN ('fixed', 'negotiable', 'price-on-call'));

-- Update existing books to have fixed price type
UPDATE books
SET price_type = 'fixed'
WHERE price_type IS NULL;

-- Update the check constraint
ALTER TABLE books
DROP CONSTRAINT IF EXISTS books_price_status_check;

ALTER TABLE books
ADD CONSTRAINT books_price_type_check 
CHECK (price_type IN ('fixed', 'negotiable', 'price-on-call')); 