-- Add board column to books table
ALTER TABLE books
ADD COLUMN IF NOT EXISTS board VARCHAR(50) CHECK (board IN ('CBSE', 'ICSE', 'State Board', 'IB', 'IGCSE', 'Other'));

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_books_board ON books(board);

-- Update existing books with default value
UPDATE books
SET board = 'Other'
WHERE board IS NULL; 