
-- Step 1: Create Security Definer Functions to avoid infinite recursion

-- Function to check if a user has direct project access
CREATE OR REPLACE FUNCTION public.user_has_project_access(p_project_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.project_access 
    WHERE project_id = p_project_id AND user_id = p_user_id
  );
END;
$$;

-- Function to check if a user has shared task access to a project
CREATE OR REPLACE FUNCTION public.user_has_shared_task_access(p_project_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.shared_tasks st
    JOIN public.tasks t ON st.task_id = t.id
    JOIN public.shots s ON t.shot_id = s.id
    JOIN public.sequences seq ON s.sequence_id = seq.id
    WHERE seq.project_id = p_project_id 
    AND st.artist_id = p_user_id
    AND st.status IN ('pending', 'approved')
  );
END;
$$;

-- Function to get all project IDs a user can access
CREATE OR REPLACE FUNCTION public.get_user_accessible_project_ids(p_user_id uuid)
RETURNS uuid[]
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  project_ids uuid[];
BEGIN
  SELECT ARRAY_AGG(DISTINCT p.id) INTO project_ids
  FROM public.projects p
  WHERE p.client_id = p_user_id 
     OR p.assigned_to = p_user_id
     OR public.user_has_project_access(p.id, p_user_id)
     OR public.user_has_shared_task_access(p.id, p_user_id);
  
  RETURN COALESCE(project_ids, ARRAY[]::uuid[]);
END;
$$;

-- Step 2: Drop ALL existing policies on projects table (comprehensive cleanup)
DROP POLICY IF EXISTS "Anyone can view projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view accessible projects" ON public.projects;
DROP POLICY IF EXISTS "Enable read access for project members" ON public.projects;
DROP POLICY IF EXISTS "projects_select_policy" ON public.projects;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.projects;
DROP POLICY IF EXISTS "projects_insert_policy" ON public.projects;
DROP POLICY IF EXISTS "Users can create projects" ON public.projects;
DROP POLICY IF EXISTS "Enable update for project owners" ON public.projects;
DROP POLICY IF EXISTS "projects_update_policy" ON public.projects;
DROP POLICY IF EXISTS "Project owners can update projects" ON public.projects;
DROP POLICY IF EXISTS "Enable delete for project owners" ON public.projects;
DROP POLICY IF EXISTS "projects_delete_policy" ON public.projects;
DROP POLICY IF EXISTS "Project owners can delete projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view their accessible projects" ON public.projects;

-- Step 3: Create new simple RLS policies for projects using security definer functions
CREATE POLICY "Users can view their accessible projects" ON public.projects
FOR SELECT USING (
  projects.id = ANY(public.get_user_accessible_project_ids(auth.uid()))
);

CREATE POLICY "Users can create projects" ON public.projects
FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Project owners can update projects" ON public.projects
FOR UPDATE USING (auth.uid() = client_id)
WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Project owners can delete projects" ON public.projects
FOR DELETE USING (auth.uid() = client_id);

-- Step 4: Clean up and fix sequences policies
DROP POLICY IF EXISTS "Artists can view sequences with assigned tasks" ON public.sequences;
DROP POLICY IF EXISTS "Users can view accessible sequences" ON public.sequences;

CREATE POLICY "Users can view accessible sequences" ON public.sequences
FOR SELECT USING (
  project_id = ANY(public.get_user_accessible_project_ids(auth.uid()))
);

-- Step 5: Clean up and fix shots policies  
DROP POLICY IF EXISTS "Artists can view shots with assigned tasks" ON public.shots;
DROP POLICY IF EXISTS "Users can view accessible shots" ON public.shots;

CREATE POLICY "Users can view accessible shots" ON public.shots
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.sequences seq 
    WHERE seq.id = shots.sequence_id 
    AND seq.project_id = ANY(public.get_user_accessible_project_ids(auth.uid()))
  )
);

-- Step 6: Fix shared_tasks policies
DROP POLICY IF EXISTS "Studios can manage their shared tasks" ON public.shared_tasks;
DROP POLICY IF EXISTS "Users can manage shared tasks" ON public.shared_tasks;

CREATE POLICY "Users can manage shared tasks" ON public.shared_tasks
FOR ALL USING (
  auth.uid() = studio_id OR auth.uid() = artist_id
);
