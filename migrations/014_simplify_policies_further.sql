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

-- Drop any triggers that might interfere
DROP TRIGGER IF EXISTS update_project_applications_updated_at ON project_applications;

-- Create extremely simple policies without any joins or subqueries
CREATE POLICY "allow_select"
  ON project_applications FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "allow_insert"
  ON project_applications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "allow_update"
  ON project_applications FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Re-enable RLS
ALTER TABLE project_applications ENABLE ROW LEVEL SECURITY;

-- Grant necessary privileges
GRANT ALL ON project_applications TO authenticated;

-- Recreate the updated_at trigger
CREATE TRIGGER update_project_applications_updated_at
  BEFORE UPDATE ON project_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at(); 