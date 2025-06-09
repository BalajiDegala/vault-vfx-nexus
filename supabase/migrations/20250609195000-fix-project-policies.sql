
-- Fix infinite recursion in project policies by simplifying them

-- First, drop the existing problematic policies for projects table
DROP POLICY IF EXISTS "Users can view accessible projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view their projects" ON public.projects;
DROP POLICY IF EXISTS "Users can create projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update projects they own" ON public.projects;
DROP POLICY IF EXISTS "Users can delete projects they own" ON public.projects;

-- Create new, simpler policies that won't cause infinite recursion
CREATE POLICY "Enable read access for project members" ON public.projects
FOR SELECT USING (
  auth.uid() = client_id OR 
  auth.uid() = assigned_to OR
  EXISTS (
    SELECT 1 FROM public.project_access 
    WHERE project_id = projects.id AND user_id = auth.uid()
  )
);

CREATE POLICY "Enable insert for authenticated users" ON public.projects
FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Enable update for project owners" ON public.projects
FOR UPDATE USING (auth.uid() = client_id)
WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Enable delete for project owners" ON public.projects
FOR DELETE USING (auth.uid() = client_id);

-- Also fix any potential issues with user_roles policies
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT USING (auth.uid() = user_id);

-- Ensure profiles table has proper policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Users can view all profiles" ON public.profiles
FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Fix shared_tasks policies to be more specific
DROP POLICY IF EXISTS "Studios can share their tasks" ON public.shared_tasks;
DROP POLICY IF EXISTS "Artists can view their shared tasks" ON public.shared_tasks;

CREATE POLICY "Studios can manage their shared tasks" ON public.shared_tasks
FOR ALL USING (
  auth.uid() = studio_id OR 
  auth.uid() = artist_id
);

-- Fix artist_task_access policies
DROP POLICY IF EXISTS "Artists can manage their task access" ON public.artist_task_access;
CREATE POLICY "Artists can manage their task access" ON public.artist_task_access
FOR ALL USING (auth.uid() = artist_id);

-- Fix project_access policies
DROP POLICY IF EXISTS "Users can view their project access" ON public.project_access;
DROP POLICY IF EXISTS "Project owners can manage access" ON public.project_access;

CREATE POLICY "Users can view their project access" ON public.project_access
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Project owners can manage access" ON public.project_access
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.projects p 
    WHERE p.id = project_id AND p.client_id = auth.uid()
  ) OR auth.uid() = user_id
);
