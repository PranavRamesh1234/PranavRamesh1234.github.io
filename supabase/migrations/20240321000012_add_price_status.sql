-- Add price_status column to books table
ALTER TABLE books
ADD COLUMN IF NOT EXISTS price_status TEXT NOT NULL DEFAULT 'fixed' 
CHECK (price_status IN ('fixed', 'negotiable', 'price-on-call'));

-- Update existing books to have fixed price status
UPDATE books
SET price_status = 'fixed'
WHERE price_status IS NULL; 