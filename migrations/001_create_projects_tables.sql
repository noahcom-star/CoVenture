-- Create profiles table first
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  avatar_url TEXT,
  bio TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  github_url TEXT,
  project_status VARCHAR(50),
  project_idea TEXT,
  skills TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  required_skills TEXT[] NOT NULL,
  team_size INTEGER NOT NULL,
  timeline VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create project applications table
CREATE TABLE IF NOT EXISTS project_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  applicant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message JSONB,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  linkedin_url VARCHAR(255),
  github_url VARCHAR(255),
  portfolio_url VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create project members table
CREATE TABLE IF NOT EXISTS project_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(project_id, user_id)
);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Enable read access for all users" ON projects;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON projects;
DROP POLICY IF EXISTS "Enable update access for project creators" ON projects;
DROP POLICY IF EXISTS "Enable delete access for project creators" ON projects;

DROP POLICY IF EXISTS "Enable read access for project creators and applicants" ON project_applications;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON project_applications;
DROP POLICY IF EXISTS "Enable update access for project creators and applicants" ON project_applications;

DROP POLICY IF EXISTS "Enable read access for all users" ON project_members;
DROP POLICY IF EXISTS "Enable all access for project creators" ON project_members;

-- Projects policies
CREATE POLICY "Enable read access for all users"
  ON projects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert access for authenticated users"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Enable update access for project creators"
  ON projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = creator_id);

CREATE POLICY "Enable delete access for project creators"
  ON projects FOR DELETE
  TO authenticated
  USING (auth.uid() = creator_id);

-- Project applications policies
CREATE POLICY "Enable read access for project creators and applicants"
  ON project_applications FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT creator_id FROM projects WHERE id = project_id
    )
    OR auth.uid() = applicant_id
  );

CREATE POLICY "Enable insert access for authenticated users"
  ON project_applications FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = applicant_id
    AND NOT EXISTS (
      SELECT 1 FROM project_applications
      WHERE project_id = project_applications.project_id
      AND applicant_id = auth.uid()
    )
  );

CREATE POLICY "Enable update access for project creators and applicants"
  ON project_applications FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT creator_id FROM projects WHERE id = project_id
    )
    OR auth.uid() = applicant_id
  );

-- Project members policies
CREATE POLICY "Enable read access for all users"
  ON project_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable all access for project creators"
  ON project_members FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT creator_id FROM projects WHERE id = project_id
    )
  );

-- Create functions
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers first
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
DROP TRIGGER IF EXISTS update_project_applications_updated_at ON project_applications;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

-- Create triggers
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_project_applications_updated_at
  BEFORE UPDATE ON project_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at(); 