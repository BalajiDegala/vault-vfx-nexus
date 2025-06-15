
-- Enable real-time functionality for direct_messages table
ALTER TABLE public.direct_messages REPLICA IDENTITY FULL;

-- Add the direct_messages table to the supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;
