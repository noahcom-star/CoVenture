-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their chat rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Users can create chat rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Users can view messages in their chat rooms" ON chat_messages;
DROP POLICY IF EXISTS "Users can send messages in their chat rooms" ON chat_messages;

-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS update_chat_room_timestamp ON chat_messages;
DROP FUNCTION IF EXISTS update_chat_room_timestamp();

-- Create simplified chat rooms policies
CREATE POLICY "chat_rooms_select"
  ON chat_rooms FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "chat_rooms_insert"
  ON chat_rooms FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create simplified chat messages policies
CREATE POLICY "chat_messages_select"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "chat_messages_insert"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    room_id IN (
      SELECT cr.id FROM chat_rooms cr
      WHERE cr.project_id IN (
        SELECT p.id FROM projects p WHERE p.creator_id = auth.uid()
      )
      OR cr.application_id IN (
        SELECT pa.id FROM project_applications pa WHERE pa.applicant_id = auth.uid()
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