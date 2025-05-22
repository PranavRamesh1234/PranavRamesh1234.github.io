-- Add foreign key constraint between books and profiles
ALTER TABLE books
ADD CONSTRAINT books_seller_id_fkey
FOREIGN KEY (seller_id)
REFERENCES profiles(id)
ON DELETE CASCADE;

-- Add RLS policy to allow reading profiles through books
CREATE POLICY "Allow reading profiles through books"
ON profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM books
    WHERE books.seller_id = profiles.id
  )
); 