-- Create universities table
CREATE TABLE universities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    key TEXT NOT NULL UNIQUE, -- e.g. 'technion', 'tau'
    calculator_type TEXT NOT NULL, -- 'technion_exact', 'linear_approx', etc.
    logo_url TEXT,
    website_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create faculties table
CREATE TABLE faculties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    university_id UUID REFERENCES universities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create programs table
CREATE TABLE programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    university_id UUID REFERENCES universities(id) ON DELETE CASCADE,
    faculty_id UUID REFERENCES faculties(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    degree_type TEXT NOT NULL, -- 'B.Sc', 'B.A', 'M.D'
    duration_years INTEGER NOT NULL,
    is_direct_track BOOLEAN DEFAULT FALSE,
    website_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_verified TIMESTAMPTZ DEFAULT NOW()
);

-- Create admission_rules table (The "Logic" store)
-- This table stores the specific thresholds for a program for a given year
CREATE TABLE admission_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
    year INTEGER NOT NULL, -- e.g. 2025
    
    -- Thresholds
    min_sekem DECIMAL(5, 2), -- e.g. 92.5
    min_psychometric INTEGER, -- e.g. 740
    direct_track_bagrut DECIMAL(5, 2), -- e.g. 112.5 (nullable)
    
    -- Specific Logic Overrides (JSONB)
    -- Example: { "math_weight": 2.0, "code": "ENG_SEKEM" }
    logic_config JSONB DEFAULT '{}'::JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create exam_schedules table (The "Temporal" engine)
CREATE TABLE exam_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_type TEXT NOT NULL, -- 'bagrut', 'psychometric', 'mor'
    season TEXT, -- 'spring_2025', 'summer_2025'
    subject TEXT, -- for bagrut: 'math_5u', 'english', etc.
    exam_date TIMESTAMPTZ NOT NULL,
    registration_deadline TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculties ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admission_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_schedules ENABLE ROW LEVEL SECURITY;

-- Public Read Access Policy (Everyone can read these)
CREATE POLICY "Public Read Universities" ON universities FOR SELECT USING (true);
CREATE POLICY "Public Read Faculties" ON faculties FOR SELECT USING (true);
CREATE POLICY "Public Read Programs" ON programs FOR SELECT USING (true);
CREATE POLICY "Public Read Rules" ON admission_rules FOR SELECT USING (true);
CREATE POLICY "Public Read Schedules" ON exam_schedules FOR SELECT USING (true);

-- Admin Write Access (Only authenticated service roles or admins)
-- For MVP, we can allow authenticated users to insert if needed, but ideally this is admin-only.
-- Leaving write policies restricted for now (only service_role has implicit bypass).
