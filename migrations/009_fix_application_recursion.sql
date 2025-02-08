-- Drop existing policies
DROP POLICY IF EXISTS "project_applications_select_policy" ON project_applications;
DROP POLICY IF EXISTS "project_applications_insert_policy" ON project_applications;
DROP POLICY IF EXISTS "project_applications_update_policy" ON project_applications;

-- Create simplified policies without recursion
CREATE POLICY "project_applications_select_policy" 
  ON project_applications FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_applications.project_id 
      AND projects.creator_id = auth.uid()
    )
    OR auth.uid() = applicant_id
  );

CREATE POLICY "project_applications_insert_policy" 
  ON project_applications FOR INSERT 
  WITH CHECK (
    auth.uid() = applicant_id
    AND NOT EXISTS (
      SELECT 1 FROM project_applications a2
      WHERE a2.project_id = project_applications.project_id
      AND a2.applicant_id = auth.uid()
    )
  );

CREATE POLICY "project_applications_update_policy" 
  ON project_applications FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_applications.project_id 
      AND projects.creator_id = auth.uid()
    )
    OR auth.uid() = applicant_id
  );

-- Verify RLS is enabled
ALTER TABLE project_applications ENABLE ROW LEVEL SECURITY;

-- Grant access to authenticated users
GRANT ALL ON project_applications TO authenticated; 