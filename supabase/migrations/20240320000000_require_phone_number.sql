-- First, add the phone_number column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'phone_number'
    ) THEN
        ALTER TABLE profiles
        ADD COLUMN phone_number TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'phone_verified'
    ) THEN
        ALTER TABLE profiles
        ADD COLUMN phone_verified BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'email'
    ) THEN
        ALTER TABLE profiles
        ADD COLUMN email TEXT;
    END IF;
END $$;

-- Create a function to handle profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        email,
        display_name,
        location,
        phone_number,
        phone_verified,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'display_name',
        NEW.raw_user_meta_data->>'location',
        NEW.raw_user_meta_data->>'phone',
        FALSE,
        NOW(),
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to automatically create profile on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS on profiles table if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update phone number" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable insert for signup" ON profiles;

-- Create or replace RLS policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Temporarily disable RLS for the update
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Update existing records to have a placeholder phone number and sync email from auth
UPDATE profiles p
SET phone_number = COALESCE(p.phone_number, '+10000000000'),
    phone_verified = COALESCE(p.phone_verified, FALSE),
    email = COALESCE(p.email, (SELECT email FROM auth.users WHERE id = p.id));

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Make phone_number required in profiles table
ALTER TABLE profiles
ALTER COLUMN phone_number SET NOT NULL;

-- Drop existing constraint if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'phone_number_format'
    ) THEN
        ALTER TABLE profiles DROP CONSTRAINT phone_number_format;
    END IF;
END $$;

-- Add a check constraint to ensure phone number is in E.164 format
ALTER TABLE profiles
ADD CONSTRAINT phone_number_format CHECK (phone_number ~ '^\+[1-9]\d{1,14}$');

-- Add an index on phone_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_phone_number ON profiles(phone_number);

-- Add a comment to explain the phone number requirement
COMMENT ON COLUMN profiles.phone_number IS 'Required phone number in E.164 format (e.g., +1234567890). This is the main mode of contact for buyers.';
COMMENT ON COLUMN profiles.phone_verified IS 'Indicates whether the phone number has been verified through OTP.';
COMMENT ON COLUMN profiles.email IS 'User email address from auth.users. Used for contact purposes.'; 