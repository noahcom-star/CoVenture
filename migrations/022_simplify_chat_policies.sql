-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their chat rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Users can create chat rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Users can view messages in their chat rooms" ON chat_messages;
DROP POLICY IF EXISTS "Users can send messages in their chat rooms" ON chat_messages;

-- Simplified chat rooms policies
CREATE POLICY "chat_rooms_select"
  ON chat_rooms FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "chat_rooms_insert"
  ON chat_rooms FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Simplified chat messages policies
CREATE POLICY "chat_messages_select"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "chat_messages_insert"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

-- Ensure RLS is enabled
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Grant necessary privileges
GRANT ALL ON chat_rooms TO authenticated;
GRANT ALL ON chat_messages TO authenticated; 