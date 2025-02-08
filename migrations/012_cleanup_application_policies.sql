-- First, disable RLS temporarily
ALTER TABLE project_applications DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DROP POLICY IF EXISTS "project_applications_select_policy" ON project_applications;
DROP POLICY IF EXISTS "project_applications_insert_policy" ON project_applications;
DROP POLICY IF EXISTS "project_applications_update_policy" ON project_applications;
DROP POLICY IF EXISTS "Enable read access for project creators and applicants" ON project_applications;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON project_applications;
DROP POLICY IF EXISTS "Enable update access for project creators and applicants" ON project_applications;
DROP POLICY IF EXISTS "applications_select" ON project_applications;
DROP POLICY IF EXISTS "applications_insert" ON project_applications;
DROP POLICY IF EXISTS "applications_update" ON project_applications;

-- Create single, simple policy for each operation
CREATE POLICY "project_applications_select"
  ON project_applications FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "project_applications_insert"
  ON project_applications FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = applicant_id
    AND NOT EXISTS (
      SELECT 1 FROM project_applications a2
      WHERE a2.project_id = project_applications.project_id
      AND a2.applicant_id = auth.uid()
    )
  );

CREATE POLICY "project_applications_update"
  ON project_applications FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = applicant_id 
    OR EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_applications.project_id 
      AND projects.creator_id = auth.uid()
    )
  );

-- Re-enable RLS
ALTER TABLE project_applications ENABLE ROW LEVEL SECURITY;

-- Grant necessary privileges
GRANT ALL ON project_applications TO authenticated; 