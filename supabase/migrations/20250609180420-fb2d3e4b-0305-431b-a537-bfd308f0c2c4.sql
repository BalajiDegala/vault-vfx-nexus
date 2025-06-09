
-- Create task sharing system
CREATE TABLE public.shared_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  studio_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  shared_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES public.profiles(id),
  notes TEXT,
  access_level TEXT NOT NULL DEFAULT 'view' CHECK (access_level IN ('view', 'edit', 'comment')),
  UNIQUE(task_id, artist_id)
);

-- Create artist task access view
CREATE TABLE public.artist_task_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shared_task_id UUID NOT NULL REFERENCES public.shared_tasks(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT now(),
  progress_status TEXT DEFAULT 'not_started' CHECK (progress_status IN ('not_started', 'in_progress', 'review', 'completed')),
  artist_notes TEXT,
  files_accessed JSONB DEFAULT '[]'::jsonb
);

-- Add project type to distinguish studio vs producer projects
ALTER TABLE public.projects 
ADD COLUMN project_type TEXT DEFAULT 'studio' CHECK (project_type IN ('studio', 'producer', 'shared'));

ALTER TABLE public.projects 
ADD COLUMN parent_project_id UUID REFERENCES public.projects(id);

ALTER TABLE public.projects 
ADD COLUMN project_code TEXT;

-- Create project access permissions
CREATE TABLE public.project_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'collaborator', 'viewer', 'task_worker')),
  granted_by UUID REFERENCES public.profiles(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  access_level TEXT DEFAULT 'limited' CHECK (access_level IN ('full', 'limited', 'task_only')),
  UNIQUE(project_id, user_id)
);

-- RLS Policies
ALTER TABLE public.shared_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_task_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_access ENABLE ROW LEVEL SECURITY;

-- Shared tasks policies
CREATE POLICY "Studios can share their tasks" ON public.shared_tasks
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'studio'
  ) AND studio_id = auth.uid()
);

CREATE POLICY "Artists can view their shared tasks" ON public.shared_tasks
FOR SELECT USING (artist_id = auth.uid());

-- Artist task access policies  
CREATE POLICY "Artists can manage their task access" ON public.artist_task_access
FOR ALL USING (artist_id = auth.uid());

-- Project access policies
CREATE POLICY "Users can view their project access" ON public.project_access
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Project owners can manage access" ON public.project_access
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.projects p 
    WHERE p.id = project_id AND p.client_id = auth.uid()
  )
);

-- Update projects RLS to consider project access
DROP POLICY IF EXISTS "Users can view their projects" ON public.projects;
CREATE POLICY "Users can view accessible projects" ON public.projects
FOR SELECT USING (
  client_id = auth.uid() OR 
  assigned_to = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.project_access pa 
    WHERE pa.project_id = id AND pa.user_id = auth.uid()
  )
);
