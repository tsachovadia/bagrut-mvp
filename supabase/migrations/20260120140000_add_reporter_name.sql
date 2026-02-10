-- Add reporter_name column to bug_reports table
ALTER TABLE bug_reports 
ADD COLUMN reporter_name text;

COMMENT ON COLUMN bug_reports.reporter_name IS 'Name provided by the user in the bug report form';
