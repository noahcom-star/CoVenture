-- Drop existing project policies
DROP POLICY IF EXISTS "Enable read access for all users" ON projects;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON projects;
DROP POLICY IF EXISTS "Enable update access for project creators" ON projects;
DROP POLICY IF EXISTS "Enable delete access for project creators" ON projects;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON projects;

-- Create simplified project policies
CREATE POLICY "projects_select_policy" 
  ON projects FOR SELECT 
  USING (true);

CREATE POLICY "projects_insert_policy" 
  ON projects FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "projects_update_policy" 
  ON projects FOR UPDATE 
  USING (auth.uid() = creator_id);

CREATE POLICY "projects_delete_policy" 
  ON projects FOR DELETE 
  USING (auth.uid() = creator_id);

-- Verify RLS is enabled
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Grant access to authenticated users
GRANT ALL ON projects TO authenticated; 