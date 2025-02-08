-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for project creators and applicants" ON project_applications;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON project_applications;
DROP POLICY IF EXISTS "Enable update access for project creators and applicants" ON project_applications;

-- Create simplified policies for project applications
CREATE POLICY "project_applications_select_policy" 
  ON project_applications FOR SELECT 
  USING (
    auth.uid() IN (
      SELECT creator_id FROM projects WHERE id = project_id
    )
    OR auth.uid() = applicant_id
  );

CREATE POLICY "project_applications_insert_policy" 
  ON project_applications FOR INSERT 
  WITH CHECK (auth.uid() = applicant_id);

CREATE POLICY "project_applications_update_policy" 
  ON project_applications FOR UPDATE 
  USING (
    auth.uid() IN (
      SELECT creator_id FROM projects WHERE id = project_id
    )
    OR auth.uid() = applicant_id
  );

-- Enable RLS
ALTER TABLE project_applications ENABLE ROW LEVEL SECURITY;

-- Grant access to authenticated users
GRANT ALL ON project_applications TO authenticated; 