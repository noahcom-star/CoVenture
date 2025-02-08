-- First, disable RLS temporarily to clean up
ALTER TABLE project_applications DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies for project_applications
DROP POLICY IF EXISTS "project_applications_select_policy" ON project_applications;
DROP POLICY IF EXISTS "project_applications_insert_policy" ON project_applications;
DROP POLICY IF EXISTS "project_applications_update_policy" ON project_applications;
DROP POLICY IF EXISTS "Enable read access for project creators and applicants" ON project_applications;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON project_applications;
DROP POLICY IF EXISTS "Enable update access for project creators and applicants" ON project_applications;

-- Create new, simple policies
CREATE POLICY "applications_select"
  ON project_applications FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "applications_insert"
  ON project_applications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = applicant_id);

CREATE POLICY "applications_update"
  ON project_applications FOR UPDATE
  TO authenticated
  USING (auth.uid() = applicant_id OR 
        auth.uid() IN (SELECT creator_id FROM projects WHERE id = project_id));

-- Re-enable RLS
ALTER TABLE project_applications ENABLE ROW LEVEL SECURITY;

-- Grant necessary privileges
GRANT ALL ON project_applications TO authenticated; 