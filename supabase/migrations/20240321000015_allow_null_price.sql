-- Modify price column to allow NULL values
ALTER TABLE books
ALTER COLUMN price DROP NOT NULL;

-- Update existing price-on-call books to have NULL price
UPDATE books
SET price = NULL
WHERE price_type = 'price-on-call'; 