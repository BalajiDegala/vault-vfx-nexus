
-- Fix the infinite recursion by simplifying the projects RLS policy
DROP POLICY IF EXISTS "Users can view accessible projects" ON public.projects;

CREATE POLICY "Users can view accessible projects" ON public.projects
FOR SELECT USING (
  -- Project owners and assigned users
  client_id = auth.uid() OR 
  assigned_to = auth.uid() OR
  -- Project access members
  EXISTS (
    SELECT 1 FROM public.project_access pa 
    WHERE pa.project_id = id AND pa.user_id = auth.uid()
  ) OR
  -- Artists with shared tasks (simplified to avoid recursion)
  id IN (
    SELECT DISTINCT seq.project_id
    FROM public.shared_tasks st
    JOIN public.tasks t ON st.task_id = t.id
    JOIN public.shots s ON t.shot_id = s.id
    JOIN public.sequences seq ON s.sequence_id = seq.id
    WHERE st.artist_id = auth.uid()
    AND st.status IN ('pending', 'approved')
  )
);

-- Fix sequences policy to avoid recursion
DROP POLICY IF EXISTS "Artists can view sequences with assigned tasks" ON public.sequences;

CREATE POLICY "Artists can view sequences with assigned tasks" 
  ON public.sequences 
  FOR SELECT 
  USING (
    -- Project owners and collaborators
    project_id IN (
      SELECT id FROM public.projects 
      WHERE client_id = auth.uid() OR assigned_to = auth.uid()
    ) OR
    -- Project access members
    EXISTS (
      SELECT 1 FROM public.project_access pa 
      WHERE pa.project_id = sequences.project_id AND pa.user_id = auth.uid()
    ) OR
    -- Artists with shared tasks
    id IN (
      SELECT DISTINCT s.sequence_id
      FROM public.shared_tasks st
      JOIN public.tasks t ON st.task_id = t.id
      JOIN public.shots s ON t.shot_id = s.id
      WHERE st.artist_id = auth.uid()
      AND st.status IN ('pending', 'approved')
    )
  );

-- Fix shots policy to avoid recursion
DROP POLICY IF EXISTS "Artists can view shots with assigned tasks" ON public.shots;

CREATE POLICY "Artists can view shots with assigned tasks" 
  ON public.shots 
  FOR SELECT 
  USING (
    -- Project owners and collaborators
    sequence_id IN (
      SELECT seq.id FROM public.sequences seq
      JOIN public.projects p ON seq.project_id = p.id
      WHERE p.client_id = auth.uid() OR p.assigned_to = auth.uid()
    ) OR
    -- Project access members
    EXISTS (
      SELECT 1 FROM public.project_access pa 
      JOIN public.sequences seq ON pa.project_id = seq.project_id
      WHERE seq.id = shots.sequence_id AND pa.user_id = auth.uid()
    ) OR
    -- Artists with shared tasks
    id IN (
      SELECT DISTINCT t.shot_id
      FROM public.shared_tasks st
      JOIN public.tasks t ON st.task_id = t.id
      WHERE st.artist_id = auth.uid()
      AND st.status IN ('pending', 'approved')
    )
  );
