
-- Create sequences table
CREATE TABLE public.sequences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shots table
CREATE TABLE public.shots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sequence_id UUID NOT NULL REFERENCES public.sequences(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  frame_start INTEGER NOT NULL DEFAULT 1001,
  frame_end INTEGER NOT NULL DEFAULT 1100,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'review', 'approved')),
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shot_id UUID NOT NULL REFERENCES public.shots(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  task_type TEXT NOT NULL CHECK (task_type IN ('modeling', 'animation', 'lighting', 'compositing', 'fx')),
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'completed')),
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  estimated_hours INTEGER,
  actual_hours INTEGER,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- RLS policies for sequences
CREATE POLICY "Users can view sequences in projects they have access to" 
  ON public.sequences 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = project_id 
      AND (p.client_id = auth.uid() OR p.assigned_to = auth.uid())
    )
  );

CREATE POLICY "Users can create sequences in projects they have access to" 
  ON public.sequences 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = project_id 
      AND (p.client_id = auth.uid() OR p.assigned_to = auth.uid())
    )
  );

CREATE POLICY "Users can update sequences in projects they have access to" 
  ON public.sequences 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = project_id 
      AND (p.client_id = auth.uid() OR p.assigned_to = auth.uid())
    )
  );

CREATE POLICY "Users can delete sequences in projects they have access to" 
  ON public.sequences 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = project_id 
      AND (p.client_id = auth.uid() OR p.assigned_to = auth.uid())
    )
  );

-- RLS policies for shots
CREATE POLICY "Users can view shots in projects they have access to" 
  ON public.shots 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.sequences s
      JOIN public.projects p ON p.id = s.project_id
      WHERE s.id = sequence_id 
      AND (p.client_id = auth.uid() OR p.assigned_to = auth.uid())
    )
  );

CREATE POLICY "Users can create shots in projects they have access to" 
  ON public.shots 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sequences s
      JOIN public.projects p ON p.id = s.project_id
      WHERE s.id = sequence_id 
      AND (p.client_id = auth.uid() OR p.assigned_to = auth.uid())
    )
  );

CREATE POLICY "Users can update shots in projects they have access to" 
  ON public.shots 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.sequences s
      JOIN public.projects p ON p.id = s.project_id
      WHERE s.id = sequence_id 
      AND (p.client_id = auth.uid() OR p.assigned_to = auth.uid())
    )
  );

CREATE POLICY "Users can delete shots in projects they have access to" 
  ON public.shots 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.sequences s
      JOIN public.projects p ON p.id = s.project_id
      WHERE s.id = sequence_id 
      AND (p.client_id = auth.uid() OR p.assigned_to = auth.uid())
    )
  );

-- RLS policies for tasks
CREATE POLICY "Users can view tasks in projects they have access to" 
  ON public.tasks 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.shots sh
      JOIN public.sequences s ON s.id = sh.sequence_id
      JOIN public.projects p ON p.id = s.project_id
      WHERE sh.id = shot_id 
      AND (p.client_id = auth.uid() OR p.assigned_to = auth.uid())
    )
  );

CREATE POLICY "Users can create tasks in projects they have access to" 
  ON public.tasks 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.shots sh
      JOIN public.sequences s ON s.id = sh.sequence_id
      JOIN public.projects p ON p.id = s.project_id
      WHERE sh.id = shot_id 
      AND (p.client_id = auth.uid() OR p.assigned_to = auth.uid())
    )
  );

CREATE POLICY "Users can update tasks in projects they have access to" 
  ON public.tasks 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.shots sh
      JOIN public.sequences s ON s.id = sh.sequence_id
      JOIN public.projects p ON p.id = s.project_id
      WHERE sh.id = shot_id 
      AND (p.client_id = auth.uid() OR p.assigned_to = auth.uid())
    )
  );

CREATE POLICY "Users can delete tasks in projects they have access to" 
  ON public.tasks 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.shots sh
      JOIN public.sequences s ON s.id = sh.sequence_id
      JOIN public.projects p ON p.id = s.project_id
      WHERE sh.id = shot_id 
      AND (p.client_id = auth.uid() OR p.assigned_to = auth.uid())
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_sequences_project_id ON public.sequences(project_id, order_index);
CREATE INDEX idx_shots_sequence_id ON public.shots(sequence_id, frame_start);
CREATE INDEX idx_tasks_shot_id ON public.tasks(shot_id, priority);
CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX idx_shots_assigned_to ON public.shots(assigned_to);

-- Add triggers for updated_at columns
CREATE TRIGGER trigger_sequences_updated_at
  BEFORE UPDATE ON public.sequences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_shots_updated_at
  BEFORE UPDATE ON public.shots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.sequences;
ALTER PUBLICATION supabase_realtime ADD TABLE public.shots;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;

-- Set replica identity for realtime updates
ALTER TABLE public.sequences REPLICA IDENTITY FULL;
ALTER TABLE public.shots REPLICA IDENTITY FULL;
ALTER TABLE public.tasks REPLICA IDENTITY FULL;
