-- First, disable RLS temporarily
ALTER TABLE project_applications DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DROP POLICY IF EXISTS "allow_all" ON project_applications;
DROP POLICY IF EXISTS "project_applications_select" ON project_applications;
DROP POLICY IF EXISTS "project_applications_insert" ON project_applications;
DROP POLICY IF EXISTS "project_applications_update" ON project_applications;
DROP POLICY IF EXISTS "project_applications_select_simple" ON project_applications;
DROP POLICY IF EXISTS "project_applications_insert_simple" ON project_applications;
DROP POLICY IF EXISTS "project_applications_update_simple" ON project_applications;

-- Drop the message column if it exists (we don't use it anymore)
ALTER TABLE project_applications DROP COLUMN IF EXISTS message;

-- Ensure we have all the required columns with correct types
ALTER TABLE project_applications 
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS github_url TEXT,
  ADD COLUMN IF NOT EXISTS portfolio_url TEXT,
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Create a single, simple policy that allows all operations for authenticated users
CREATE POLICY "allow_all" ON project_applications
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Re-enable RLS
ALTER TABLE project_applications ENABLE ROW LEVEL SECURITY;

-- Grant necessary privileges
GRANT ALL ON project_applications TO authenticated;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_project_applications_updated_at ON project_applications;
CREATE TRIGGER update_project_applications_updated_at
  BEFORE UPDATE ON project_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at(); 