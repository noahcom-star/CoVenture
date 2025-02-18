-- Enable real-time for chat_messages table
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- Ensure the table is set up for real-time
ALTER TABLE chat_messages REPLICA IDENTITY FULL; 