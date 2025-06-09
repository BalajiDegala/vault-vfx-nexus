
-- Create a table for real-time messages within projects
CREATE TABLE public.project_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'file_upload', 'status_update')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create a table for tracking user presence in projects
CREATE TABLE public.project_presence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'online' CHECK (status IN ('online', 'away', 'offline')),
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  current_section TEXT DEFAULT 'overview', -- overview, tasks, files, etc.
  UNIQUE(project_id, user_id)
);

-- Create a table for project notifications
CREATE TABLE public.project_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('message', 'status_change', 'assignment', 'deadline', 'file_upload')),
  title TEXT NOT NULL,
  content TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.project_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for project_messages
CREATE POLICY "Users can view messages in projects they have access to" 
  ON public.project_messages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = project_id 
      AND (p.client_id = auth.uid() OR p.assigned_to = auth.uid())
    )
  );

CREATE POLICY "Users can send messages to projects they have access to" 
  ON public.project_messages 
  FOR INSERT 
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = project_id 
      AND (p.client_id = auth.uid() OR p.assigned_to = auth.uid())
    )
  );

-- RLS policies for project_presence
CREATE POLICY "Users can view presence in projects they have access to" 
  ON public.project_presence 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = project_id 
      AND (p.client_id = auth.uid() OR p.assigned_to = auth.uid())
    )
  );

CREATE POLICY "Users can update their own presence" 
  ON public.project_presence 
  FOR ALL 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS policies for project_notifications
CREATE POLICY "Users can view their own notifications" 
  ON public.project_notifications 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" 
  ON public.project_notifications 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" 
  ON public.project_notifications 
  FOR UPDATE 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_presence;
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_notifications;

-- Set replica identity for realtime updates
ALTER TABLE public.project_messages REPLICA IDENTITY FULL;
ALTER TABLE public.project_presence REPLICA IDENTITY FULL;
ALTER TABLE public.project_notifications REPLICA IDENTITY FULL;

-- Create indexes for better performance
CREATE INDEX idx_project_messages_project_id ON public.project_messages(project_id, created_at DESC);
CREATE INDEX idx_project_presence_project_id ON public.project_presence(project_id, user_id);
CREATE INDEX idx_project_notifications_user_id ON public.project_notifications(user_id, created_at DESC);

-- Function to automatically update presence last_seen
CREATE OR REPLACE FUNCTION update_presence_last_seen()
RETURNS trigger AS $$
BEGIN
  NEW.last_seen = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update last_seen on presence updates
CREATE TRIGGER trigger_update_presence_last_seen
  BEFORE UPDATE ON public.project_presence
  FOR EACH ROW
  EXECUTE FUNCTION update_presence_last_seen();
