-- Drop ALL existing policies first
DROP POLICY IF EXISTS "Users can view their chat rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Users can create chat rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Users can view messages in their chat rooms" ON chat_messages;
DROP POLICY IF EXISTS "Users can send messages in their chat rooms" ON chat_messages;
DROP POLICY IF EXISTS "chat_rooms_select" ON chat_rooms;
DROP POLICY IF EXISTS "chat_rooms_insert" ON chat_rooms;
DROP POLICY IF EXISTS "chat_messages_select" ON chat_messages;
DROP POLICY IF EXISTS "chat_messages_insert" ON chat_messages;

-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS update_chat_room_timestamp ON chat_messages;
DROP FUNCTION IF EXISTS update_chat_room_timestamp();

-- Add unique constraint to profiles.user_id
ALTER TABLE profiles
ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);

-- Add foreign key relationships
ALTER TABLE chat_messages
ADD CONSTRAINT chat_messages_sender_fkey
FOREIGN KEY (sender_id) REFERENCES profiles(user_id)
ON DELETE CASCADE;

-- Create simplified chat rooms policies
CREATE POLICY "chat_rooms_select"
  ON chat_rooms FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "chat_rooms_insert"
  ON chat_rooms FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_id AND p.creator_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM project_applications pa
      WHERE pa.id = application_id AND pa.applicant_id = auth.uid()
    )
  );

-- Create simplified chat messages policies
CREATE POLICY "chat_messages_select"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "chat_messages_insert"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM chat_rooms cr
      WHERE cr.id = room_id AND (
        EXISTS (
          SELECT 1 FROM projects p
          WHERE p.id = cr.project_id AND p.creator_id = auth.uid()
        ) OR
        EXISTS (
          SELECT 1 FROM project_applications pa
          WHERE pa.id = cr.application_id AND pa.applicant_id = auth.uid()
        )
      )
    )
  );

-- Create function to update chat room timestamp
CREATE OR REPLACE FUNCTION update_chat_room_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_rooms
  SET updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.room_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating chat room timestamp
CREATE TRIGGER update_chat_room_timestamp
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_room_timestamp(); 