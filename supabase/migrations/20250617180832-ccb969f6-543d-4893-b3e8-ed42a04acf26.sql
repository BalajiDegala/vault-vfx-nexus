
-- Update projects RLS to allow artists to see only projects where they have assigned tasks
DROP POLICY IF EXISTS "Users can view accessible projects" ON public.projects;

CREATE POLICY "Users can view accessible projects" ON public.projects
FOR SELECT USING (
  client_id = auth.uid() OR 
  assigned_to = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.project_access pa 
    WHERE pa.project_id = id AND pa.user_id = auth.uid()
  ) OR
  -- Artists can see projects where they have shared tasks
  EXISTS (
    SELECT 1 FROM public.shared_tasks st
    JOIN public.tasks t ON st.task_id = t.id
    JOIN public.shots s ON t.shot_id = s.id
    JOIN public.sequences seq ON s.sequence_id = seq.id
    WHERE seq.project_id = projects.id 
    AND st.artist_id = auth.uid()
    AND st.status IN ('pending', 'approved')
  )
);

-- Add RLS policy for sequences to allow artists to see only sequences with assigned tasks
CREATE POLICY "Artists can view sequences with assigned tasks" 
  ON public.sequences 
  FOR SELECT 
  USING (
    -- Project owners and collaborators can see all sequences
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = sequences.project_id 
      AND (p.client_id = auth.uid() OR p.assigned_to = auth.uid())
    ) OR
    -- Project access members can see sequences
    EXISTS (
      SELECT 1 FROM public.project_access pa 
      WHERE pa.project_id = sequences.project_id AND pa.user_id = auth.uid()
    ) OR
    -- Artists can see sequences where they have assigned tasks
    EXISTS (
      SELECT 1 FROM public.shared_tasks st
      JOIN public.tasks t ON st.task_id = t.id
      JOIN public.shots s ON t.shot_id = s.id
      WHERE s.sequence_id = sequences.id 
      AND st.artist_id = auth.uid()
      AND st.status IN ('pending', 'approved')
    )
  );

-- Add RLS policy for shots to allow artists to see only shots with assigned tasks
CREATE POLICY "Artists can view shots with assigned tasks" 
  ON public.shots 
  FOR SELECT 
  USING (
    -- Project owners and collaborators can see all shots
    EXISTS (
      SELECT 1 FROM public.projects p 
      JOIN public.sequences seq ON p.id = seq.project_id
      WHERE seq.id = shots.sequence_id 
      AND (p.client_id = auth.uid() OR p.assigned_to = auth.uid())
    ) OR
    -- Project access members can see shots
    EXISTS (
      SELECT 1 FROM public.project_access pa 
      JOIN public.sequences seq ON pa.project_id = seq.project_id
      WHERE seq.id = shots.sequence_id AND pa.user_id = auth.uid()
    ) OR
    -- Artists can see shots where they have assigned tasks
    EXISTS (
      SELECT 1 FROM public.shared_tasks st
      JOIN public.tasks t ON st.task_id = t.id
      WHERE t.shot_id = shots.id 
      AND st.artist_id = auth.uid()
      AND st.status IN ('pending', 'approved')
    )
  );
