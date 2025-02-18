-- Enable real-time for chat_messages table
BEGIN;

-- Create the publication if it doesn't exist
CREATE PUBLICATION IF NOT EXISTS supabase_realtime;

-- Add the chat_messages table to the publication
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- Ensure the table is set up for real-time
ALTER TABLE chat_messages REPLICA IDENTITY FULL;

COMMIT; 