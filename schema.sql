-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 13 AND age <= 19),
  email TEXT UNIQUE NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  skills TEXT[],
  interests TEXT[],
  linkedin_url TEXT,
  website_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES profiles(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  required_skills TEXT[],
  team_size INTEGER NOT NULL,
  timeline TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create matches table
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id UUID REFERENCES profiles(id) NOT NULL,
  user2_id UUID REFERENCES profiles(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT unique_match UNIQUE(user1_id, user2_id),
  CONSTRAINT different_users CHECK (user1_id != user2_id)
);

-- Create project_applications table
CREATE TABLE project_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) NOT NULL,
  applicant_id UUID REFERENCES profiles(id) NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT unique_application UNIQUE(project_id, applicant_id)
);

-- Create messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) NOT NULL,
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_project_applications_updated_at
  BEFORE UPDATE ON project_applications
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- Create RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Projects policies
CREATE POLICY "Projects are viewable by everyone"
ON projects FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create projects"
ON projects FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Project creators can update their projects"
ON projects FOR UPDATE
TO authenticated
USING (auth.uid() = creator_id);

-- Matches policies
CREATE POLICY "Users can view their own matches"
ON matches FOR SELECT
TO authenticated
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create matches"
ON matches FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user1_id);

CREATE POLICY "Match participants can update match status"
ON matches FOR UPDATE
TO authenticated
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Project applications policies
CREATE POLICY "Users can view applications for their projects"
ON project_applications FOR SELECT
TO authenticated
USING (
  auth.uid() IN (
    SELECT creator_id FROM projects WHERE id = project_applications.project_id
  )
  OR auth.uid() = applicant_id
);

CREATE POLICY "Users can apply to projects"
ON project_applications FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = applicant_id);

CREATE POLICY "Project owners and applicants can update applications"
ON project_applications FOR UPDATE
TO authenticated
USING (
  auth.uid() IN (
    SELECT creator_id FROM projects WHERE id = project_applications.project_id
  )
  OR auth.uid() = applicant_id
);

-- Messages policies
CREATE POLICY "Match participants can view their messages"
ON messages FOR SELECT
TO authenticated
USING (
  auth.uid() IN (
    SELECT user1_id FROM matches WHERE id = messages.match_id
    UNION
    SELECT user2_id FROM matches WHERE id = messages.match_id
  )
);

CREATE POLICY "Match participants can insert messages"
ON messages FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = sender_id
  AND
  auth.uid() IN (
    SELECT user1_id FROM matches WHERE id = match_id
    UNION
    SELECT user2_id FROM matches WHERE id = match_id
  )
); 