
-- Create direct_messages table for user-to-user messaging
CREATE TABLE public.direct_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages they sent or received
CREATE POLICY "Users can view their own messages" ON public.direct_messages
  FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

-- Users can insert messages they are sending
CREATE POLICY "Users can send messages" ON public.direct_messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Users can update their own sent messages
CREATE POLICY "Users can update their sent messages" ON public.direct_messages
  FOR UPDATE USING (auth.uid() = sender_id);

-- Users can delete their own sent messages
CREATE POLICY "Users can delete their sent messages" ON public.direct_messages
  FOR DELETE USING (auth.uid() = sender_id);

-- Add indexes for better performance
CREATE INDEX idx_direct_messages_sender_receiver ON public.direct_messages(sender_id, receiver_id);
CREATE INDEX idx_direct_messages_created_at ON public.direct_messages(created_at);

-- Enable realtime for direct messages
ALTER TABLE public.direct_messages REPLICA IDENTITY FULL;
