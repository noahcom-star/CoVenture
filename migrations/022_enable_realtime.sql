-- Enable real-time for chat_messages table
BEGIN;

-- Create the publication if it doesn't exist (using DO block for conditional creation)
DO
$$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication
    WHERE pubname = 'supabase_realtime'
  ) THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END
$$;

-- Add the chat_messages table to the publication if not already added
DO
$$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND tablename = 'chat_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
  END IF;
END
$$;

-- Ensure the table is set up for real-time
ALTER TABLE chat_messages REPLICA IDENTITY FULL;

COMMIT; 