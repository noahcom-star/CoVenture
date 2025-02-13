-- Create chat rooms table
CREATE TABLE IF NOT EXISTS chat_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  application_id UUID REFERENCES project_applications(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(project_id, application_id)
);

-- Create chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their chat rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Project creators can create chat rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Users can view messages in their chat rooms" ON chat_messages;
DROP POLICY IF EXISTS "Users can send messages in their chat rooms" ON chat_messages;

-- Chat rooms policies
CREATE POLICY "Users can view their chat rooms"
  ON chat_rooms FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT creator_id FROM projects WHERE id = project_id
      UNION
      SELECT applicant_id FROM project_applications WHERE id = application_id
    )
  );

CREATE POLICY "Users can create chat rooms"
  ON chat_rooms FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT creator_id FROM projects WHERE id = project_id
      UNION
      SELECT applicant_id FROM project_applications WHERE id = application_id
    )
  );

-- Chat messages policies
CREATE POLICY "Users can view messages in their chat rooms"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT p.creator_id
      FROM chat_rooms cr
      JOIN projects p ON p.id = cr.project_id
      WHERE cr.id = room_id
      UNION
      SELECT pa.applicant_id
      FROM chat_rooms cr
      JOIN project_applications pa ON pa.id = cr.application_id
      WHERE cr.id = room_id
    )
  );

CREATE POLICY "Users can send messages in their chat rooms"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND auth.uid() IN (
      SELECT p.creator_id
      FROM chat_rooms cr
      JOIN projects p ON p.id = cr.project_id
      WHERE cr.id = room_id
      UNION
      SELECT pa.applicant_id
      FROM chat_rooms cr
      JOIN project_applications pa ON pa.id = cr.application_id
      WHERE cr.id = room_id
    )
  );

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_chat_rooms_updated_at ON chat_rooms;
DROP TRIGGER IF EXISTS update_chat_messages_updated_at ON chat_messages;

-- Create triggers
CREATE TRIGGER update_chat_rooms_updated_at
  BEFORE UPDATE ON chat_rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_chat_messages_updated_at
  BEFORE UPDATE ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at(); 