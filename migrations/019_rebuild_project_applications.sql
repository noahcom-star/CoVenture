-- Drop the existing table and all its policies
DROP TABLE IF EXISTS project_applications CASCADE;

-- Recreate the table from scratch
CREATE TABLE project_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    applicant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    linkedin_url TEXT,
    github_url TEXT,
    portfolio_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE project_applications ENABLE ROW LEVEL SECURITY;

-- Create a single, simple policy for SELECT
CREATE POLICY "project_applications_select_policy" ON project_applications
    FOR SELECT TO authenticated
    USING (true);

-- Create a simple policy for INSERT
CREATE POLICY "project_applications_insert_policy" ON project_applications
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = applicant_id);

-- Create a simple policy for UPDATE
CREATE POLICY "project_applications_update_policy" ON project_applications
    FOR UPDATE TO authenticated
    USING (auth.uid() = applicant_id OR 
          EXISTS (
              SELECT 1 FROM projects 
              WHERE projects.id = project_applications.project_id 
              AND projects.creator_id = auth.uid()
          ));

-- Grant privileges
GRANT ALL ON project_applications TO authenticated;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_project_applications_updated_at ON project_applications;
CREATE TRIGGER update_project_applications_updated_at
    BEFORE UPDATE ON project_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at(); 