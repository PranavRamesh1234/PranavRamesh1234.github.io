-- Add missing columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS display_name text,
ADD COLUMN IF NOT EXISTS location text;

-- Update existing profiles to have default values
UPDATE profiles
SET 
  display_name = email,
  location = ''
WHERE display_name IS NULL;

-- Make columns required for new profiles
ALTER TABLE profiles
ALTER COLUMN display_name SET NOT NULL,
ALTER COLUMN location SET NOT NULL; 