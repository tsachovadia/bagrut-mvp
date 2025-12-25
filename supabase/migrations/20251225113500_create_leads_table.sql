-- Create custom type for lead status
CREATE TYPE lead_status AS ENUM ('new', 'draft_generated', 'sent', 'replied');

-- Create leads table
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facebook_user_id TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    profile_link TEXT,
    age TEXT, -- Mapped from Q1/A1
    dilemma TEXT, -- Crucial: Mapped from Q3/A3
    email TEXT, -- Extracted from comments
    status lead_status DEFAULT 'new',
    ai_draft TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to do everything (for the admin tool)
CREATE POLICY "Allow all operations for authenticated users" ON leads
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
