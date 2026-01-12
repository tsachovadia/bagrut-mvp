CREATE TABLE soft_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT,
    phone TEXT,
    interest TEXT,
    source TEXT DEFAULT 'website_modal',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE soft_leads ENABLE ROW LEVEL SECURITY;

-- Allow ANYONE (anon) to INSERT leads
CREATE POLICY "Allow public insert" ON soft_leads
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Only authenticated users (admins/service role) can view
CREATE POLICY "Allow authenticated view" ON soft_leads
    FOR SELECT
    TO authenticated
    USING (true);
