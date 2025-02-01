-- Drop everything and recreate the schema
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Recreate the extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- First disable row level security
ALTER TABLE IF EXISTS messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS project_applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS matches DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;

-- Drop triggers first
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
DROP TRIGGER IF EXISTS update_matches_updated_at ON matches;
DROP TRIGGER IF EXISTS update_project_applications_updated_at ON project_applications;

-- Drop policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Projects are viewable by everyone" ON projects;
DROP POLICY IF EXISTS "Authenticated users can create projects" ON projects;
DROP POLICY IF EXISTS "Project creators can update their projects" ON projects;
DROP POLICY IF EXISTS "Users can view their own matches" ON matches;
DROP POLICY IF EXISTS "Users can create matches" ON matches;
DROP POLICY IF EXISTS "Match participants can update match status" ON matches;
DROP POLICY IF EXISTS "Users can view applications for their projects" ON project_applications;
DROP POLICY IF EXISTS "Users can apply to projects" ON project_applications;
DROP POLICY IF EXISTS "Project owners and applicants can update applications" ON project_applications;
DROP POLICY IF EXISTS "Match participants can view their messages" ON messages;
DROP POLICY IF EXISTS "Match participants can insert messages" ON messages;

-- Drop tables in correct order (dependent tables first)
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS project_applications CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Reset any sequences
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT sequencename FROM pg_sequences WHERE schemaname = current_schema()) LOOP
        EXECUTE 'DROP SEQUENCE IF EXISTS ' || r.sequencename || ' CASCADE';
    END LOOP;
END $$; 
