-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their chat rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Users can create chat rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Users can view messages in their chat rooms" ON chat_messages;
DROP POLICY IF EXISTS "Users can send messages in their chat rooms" ON chat_messages;

-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS update_chat_room_timestamp ON chat_messages;
DROP FUNCTION IF EXISTS update_chat_room_timestamp();

-- Create new chat rooms policies
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

-- Create new chat messages policies
CREATE POLICY "Users can view messages in their chat rooms"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (
    room_id IN (
      SELECT id FROM chat_rooms
      WHERE auth.uid() IN (
        SELECT creator_id FROM projects WHERE id = project_id
        UNION
        SELECT applicant_id FROM project_applications WHERE id = application_id
      )
    )
  );

CREATE POLICY "Users can send messages in their chat rooms"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    room_id IN (
      SELECT id FROM chat_rooms
      WHERE auth.uid() IN (
        SELECT creator_id FROM projects WHERE id = project_id
        UNION
        SELECT applicant_id FROM project_applications WHERE id = application_id
      )
    )
  );

-- Create new function and trigger to update chat_rooms updated_at
CREATE OR REPLACE FUNCTION update_chat_room_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_rooms
  SET updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.room_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_chat_room_timestamp
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_room_timestamp(); 