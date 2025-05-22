-- First update existing data to use valid categories
UPDATE books
SET category = 'textbooks'
WHERE category NOT IN ('textbooks', 'guides', 'notes', 'competitive');

-- Then update the constraint
ALTER TABLE books
DROP CONSTRAINT IF EXISTS books_category_check;

ALTER TABLE books
ADD CONSTRAINT books_category_check 
CHECK (category IN ('textbooks', 'guides', 'notes', 'competitive')); 