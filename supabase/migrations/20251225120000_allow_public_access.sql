-- Drop the restrictive policy
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON leads;

-- Create a permissive policy for MVP (Allows Anon/Public access)
CREATE POLICY "Allow public access for MVP" ON leads
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);
