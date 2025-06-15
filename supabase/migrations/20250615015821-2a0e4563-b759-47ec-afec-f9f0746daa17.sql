
-- Create table for custom project statuses
CREATE TABLE public.project_statuses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6b7280',
  is_system_status BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for status transition rules
CREATE TABLE public.project_status_transitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_status TEXT NOT NULL,
  to_status TEXT NOT NULL,
  allowed_roles TEXT[] DEFAULT ARRAY['admin', 'studio', 'producer'],
  requires_approval BOOLEAN DEFAULT false,
  auto_notification BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for project status history
CREATE TABLE public.project_status_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users,
  reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default system statuses
INSERT INTO public.project_statuses (name, description, color, is_system_status, sort_order) VALUES
('draft', 'Project is in draft stage', '#6b7280', true, 1),
('open', 'Project is open for bids', '#10b981', true, 2),
('in_progress', 'Project is currently being worked on', '#3b82f6', true, 3),
('review', 'Project is under review', '#f59e0b', true, 4),
('completed', 'Project has been completed', '#8b5cf6', true, 5),
('cancelled', 'Project has been cancelled', '#ef4444', true, 6);

-- Insert default transition rules
INSERT INTO public.project_status_transitions (from_status, to_status, allowed_roles) VALUES
('draft', 'open', ARRAY['admin', 'studio', 'producer']),
('open', 'in_progress', ARRAY['admin', 'studio', 'producer']),
('in_progress', 'review', ARRAY['admin', 'studio', 'producer', 'artist']),
('review', 'completed', ARRAY['admin', 'studio', 'producer']),
('review', 'in_progress', ARRAY['admin', 'studio', 'producer']),
('draft', 'cancelled', ARRAY['admin', 'studio', 'producer']),
('open', 'cancelled', ARRAY['admin', 'studio', 'producer']),
('in_progress', 'cancelled', ARRAY['admin', 'studio', 'producer']);

-- Enable RLS
ALTER TABLE public.project_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_status_transitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_status_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for project_statuses
CREATE POLICY "Everyone can view project statuses" ON public.project_statuses FOR SELECT USING (true);
CREATE POLICY "Admins can manage project statuses" ON public.project_statuses FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- RLS policies for project_status_transitions
CREATE POLICY "Everyone can view status transitions" ON public.project_status_transitions FOR SELECT USING (true);
CREATE POLICY "Admins can manage status transitions" ON public.project_status_transitions FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- RLS policies for project_status_history
CREATE POLICY "Users can view project status history for accessible projects" ON public.project_status_history FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = project_status_history.project_id 
    AND (
      projects.client_id = auth.uid() 
      OR projects.assigned_to = auth.uid()
      OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'studio'))
    )
  )
);

CREATE POLICY "Users can insert project status history" ON public.project_status_history FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = project_status_history.project_id 
    AND (
      projects.client_id = auth.uid() 
      OR projects.assigned_to = auth.uid()
      OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'studio'))
    )
  )
);

-- Add trigger for updating updated_at
CREATE TRIGGER update_project_statuses_updated_at
  BEFORE UPDATE ON public.project_statuses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add function to validate status transitions
CREATE OR REPLACE FUNCTION validate_project_status_transition(
  p_project_id UUID,
  p_from_status TEXT,
  p_to_status TEXT,
  p_user_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  user_roles_array TEXT[];
  transition_allowed BOOLEAN := false;
BEGIN
  -- Get user roles
  SELECT ARRAY_AGG(role::TEXT) INTO user_roles_array
  FROM user_roles 
  WHERE user_id = p_user_id;
  
  -- Check if transition is allowed
  SELECT EXISTS (
    SELECT 1 FROM project_status_transitions 
    WHERE from_status = p_from_status 
    AND to_status = p_to_status
    AND allowed_roles && user_roles_array
  ) INTO transition_allowed;
  
  RETURN transition_allowed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
