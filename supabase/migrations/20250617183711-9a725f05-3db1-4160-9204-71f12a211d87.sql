
-- Add missing RLS policies for sequences
CREATE POLICY "Users can create sequences in accessible projects" ON public.sequences
FOR INSERT WITH CHECK (
  project_id = ANY(public.get_user_accessible_project_ids(auth.uid()))
);

CREATE POLICY "Users can update sequences in accessible projects" ON public.sequences
FOR UPDATE USING (
  project_id = ANY(public.get_user_accessible_project_ids(auth.uid()))
);

CREATE POLICY "Users can delete sequences in accessible projects" ON public.sequences
FOR DELETE USING (
  project_id = ANY(public.get_user_accessible_project_ids(auth.uid()))
);

-- Add missing RLS policies for shots
CREATE POLICY "Users can create shots in accessible sequences" ON public.shots
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.sequences seq 
    WHERE seq.id = shots.sequence_id 
    AND seq.project_id = ANY(public.get_user_accessible_project_ids(auth.uid()))
  )
);

CREATE POLICY "Users can update shots in accessible sequences" ON public.shots
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.sequences seq 
    WHERE seq.id = shots.sequence_id 
    AND seq.project_id = ANY(public.get_user_accessible_project_ids(auth.uid()))
  )
);

CREATE POLICY "Users can delete shots in accessible sequences" ON public.shots
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.sequences seq 
    WHERE seq.id = shots.sequence_id 
    AND seq.project_id = ANY(public.get_user_accessible_project_ids(auth.uid()))
  )
);

-- Add missing RLS policies for tasks
CREATE POLICY "Users can create tasks in accessible shots" ON public.tasks
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.shots s
    JOIN public.sequences seq ON s.sequence_id = seq.id
    WHERE s.id = tasks.shot_id 
    AND seq.project_id = ANY(public.get_user_accessible_project_ids(auth.uid()))
  )
);

CREATE POLICY "Users can update tasks in accessible shots" ON public.tasks
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.shots s
    JOIN public.sequences seq ON s.sequence_id = seq.id
    WHERE s.id = tasks.shot_id 
    AND seq.project_id = ANY(public.get_user_accessible_project_ids(auth.uid()))
  )
);

CREATE POLICY "Users can delete tasks in accessible shots" ON public.tasks
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.shots s
    JOIN public.sequences seq ON s.sequence_id = seq.id
    WHERE s.id = tasks.shot_id 
    AND seq.project_id = ANY(public.get_user_accessible_project_ids(auth.uid()))
  )
);
