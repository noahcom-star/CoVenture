-- Update Projects RLS policies
DROP POLICY IF EXISTS "Enable read access for all users" ON projects;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON projects;
DROP POLICY IF EXISTS "Enable update access for project creators" ON projects;
DROP POLICY IF EXISTS "Enable delete access for project creators" ON projects;

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

-- Update Project Applications RLS policies
DROP POLICY IF EXISTS "Enable read access for project creators and applicants" ON project_applications;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON project_applications;
DROP POLICY IF EXISTS "Enable update access for project creators and applicants" ON project_applications;

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

-- Update Project Members RLS policies
DROP POLICY IF EXISTS "Enable read access for all users" ON project_members;
DROP POLICY IF EXISTS "Enable all access for project creators" ON project_members;

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