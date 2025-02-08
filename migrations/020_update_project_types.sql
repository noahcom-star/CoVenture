-- Add any missing foreign key relationships
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS project_applications_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS pending_applications_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS accepted_applications_count INTEGER DEFAULT 0;

-- Create a function to update application counts
CREATE OR REPLACE FUNCTION update_project_application_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Update counts for the affected project
  WITH counts AS (
    SELECT
      COUNT(*) as total_count,
      COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
      COUNT(*) FILTER (WHERE status = 'accepted') as accepted_count
    FROM project_applications
    WHERE project_id = COALESCE(NEW.project_id, OLD.project_id)
  )
  UPDATE projects
  SET
    project_applications_count = counts.total_count,
    pending_applications_count = counts.pending_count,
    accepted_applications_count = counts.accepted_count
  FROM counts
  WHERE id = COALESCE(NEW.project_id, OLD.project_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update counts on application changes
DROP TRIGGER IF EXISTS update_project_counts ON project_applications;
CREATE TRIGGER update_project_counts
  AFTER INSERT OR UPDATE OR DELETE ON project_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_project_application_counts();

-- Update initial counts
WITH counts AS (
  SELECT
    project_id,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
    COUNT(*) FILTER (WHERE status = 'accepted') as accepted_count
  FROM project_applications
  GROUP BY project_id
)
UPDATE projects p
SET
  project_applications_count = COALESCE(c.total_count, 0),
  pending_applications_count = COALESCE(c.pending_count, 0),
  accepted_applications_count = COALESCE(c.accepted_count, 0)
FROM counts c
WHERE p.id = c.project_id; 