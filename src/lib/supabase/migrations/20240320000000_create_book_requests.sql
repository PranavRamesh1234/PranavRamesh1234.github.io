-- Create book_requests table
CREATE TABLE IF NOT EXISTS book_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    author TEXT,
    subject TEXT NOT NULL,
    class TEXT NOT NULL,
    board TEXT NOT NULL,
    location TEXT,
    max_budget DECIMAL(10,2),
    condition TEXT NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'fulfilled', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS book_requests_buyer_id_idx ON book_requests(buyer_id);
CREATE INDEX IF NOT EXISTS book_requests_status_idx ON book_requests(status);

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert their own requests" ON book_requests;
DROP POLICY IF EXISTS "Users can view all open requests" ON book_requests;
DROP POLICY IF EXISTS "Users can update their own requests" ON book_requests;
DROP POLICY IF EXISTS "Users can delete their own requests" ON book_requests;

-- Create RLS policies
ALTER TABLE book_requests ENABLE ROW LEVEL SECURITY;

-- Policy for inserting requests (authenticated users only)
CREATE POLICY "Users can insert their own requests"
ON book_requests FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = buyer_id);

-- Policy for viewing requests (authenticated users can view all open requests)
CREATE POLICY "Users can view all open requests"
ON book_requests FOR SELECT
TO authenticated
USING (status = 'open');

-- Policy for updating own requests
CREATE POLICY "Users can update their own requests"
ON book_requests FOR UPDATE
TO authenticated
USING (auth.uid() = buyer_id)
WITH CHECK (auth.uid() = buyer_id);

-- Policy for deleting own requests
CREATE POLICY "Users can delete their own requests"
ON book_requests FOR DELETE
TO authenticated
USING (auth.uid() = buyer_id);

-- Drop existing function and trigger if they exist
DROP TRIGGER IF EXISTS set_updated_at ON book_requests;
DROP FUNCTION IF EXISTS handle_updated_at();

-- Create function to handle updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON book_requests
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Drop existing view if it exists
DROP VIEW IF EXISTS book_requests_with_buyer;

-- Create view for book requests with buyer information
CREATE OR REPLACE VIEW book_requests_with_buyer AS
SELECT 
    br.*,
    p.full_name as buyer_name,
    p.email as buyer_email
FROM book_requests br
JOIN profiles p ON br.buyer_id = p.id; 