-- Completely disable RLS temporarily
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
DROP POLICY IF EXISTS "project_applications_select" ON project_applications;
DROP POLICY IF EXISTS "project_applications_insert" ON project_applications;
DROP POLICY IF EXISTS "project_applications_update" ON project_applications;
DROP POLICY IF EXISTS "allow_select" ON project_applications;
DROP POLICY IF EXISTS "allow_insert" ON project_applications;
DROP POLICY IF EXISTS "allow_update" ON project_applications;

-- Create a single, extremely simple policy that allows all operations for authenticated users
CREATE POLICY "allow_all"
  ON project_applications
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Re-enable RLS
ALTER TABLE project_applications ENABLE ROW LEVEL SECURITY;

-- Grant necessary privileges
GRANT ALL ON project_applications TO authenticated; 