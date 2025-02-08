-- Drop ALL existing policies first
DROP POLICY IF EXISTS "Enable read access for all users" ON projects;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON projects;
DROP POLICY IF EXISTS "Enable update access for project creators" ON projects;
DROP POLICY IF EXISTS "Enable delete access for project creators" ON projects;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON projects;
DROP POLICY IF EXISTS "Enable update for project creators" ON projects;
DROP POLICY IF EXISTS "Enable delete for project creators" ON projects;

-- Drop profile policies
DROP POLICY IF EXISTS "Enable read access for profiles" ON profiles;
DROP POLICY IF EXISTS "Enable insert for profiles" ON profiles;
DROP POLICY IF EXISTS "Enable update for own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for own profile" ON profiles;

-- Drop project members policies
DROP POLICY IF EXISTS "Enable read access for all users" ON project_members;
DROP POLICY IF EXISTS "Enable insert for project creators" ON project_members;
DROP POLICY IF EXISTS "Enable all access for project creators" ON project_members;

-- Create simplified policies for projects
CREATE POLICY "Enable read access for all users"
  ON projects FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for project creators"
  ON projects FOR UPDATE
  USING (auth.uid() = creator_id);

CREATE POLICY "Enable delete for project creators"
  ON projects FOR DELETE
  USING (auth.uid() = creator_id);

-- Verify RLS is enabled
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Grant access to authenticated users
GRANT ALL ON projects TO authenticated;

-- Add policies for profiles table
CREATE POLICY "Enable read access for profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Verify RLS is enabled for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Grant access to authenticated users
GRANT ALL ON profiles TO authenticated;

-- Create project members policies
CREATE POLICY "Enable read access for all users"
  ON project_members FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for project creators"
  ON project_members FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT creator_id FROM projects WHERE id = project_id
    )
  );

-- Verify RLS is enabled
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

-- Grant access to authenticated users
GRANT ALL ON project_members TO authenticated; 