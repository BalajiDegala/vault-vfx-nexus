
-- Add RLS policy to allow artists to view tasks shared with them
CREATE POLICY "Artists can view tasks shared with them" 
  ON public.tasks 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.shared_tasks st 
      WHERE st.task_id = tasks.id 
      AND st.artist_id = auth.uid()
      AND st.status IN ('pending', 'approved')
    )
  );
