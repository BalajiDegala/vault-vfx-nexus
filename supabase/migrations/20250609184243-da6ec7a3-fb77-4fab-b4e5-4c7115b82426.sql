
-- Drop all existing problematic policies for projects table
DROP POLICY IF EXISTS "Users can view projects they created" ON public.projects;
DROP POLICY IF EXISTS "Users can insert their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;
DROP POLICY IF EXISTS "Enable read access for project members" ON public.projects;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.projects;
DROP POLICY IF EXISTS "Enable update for project owners" ON public.projects;
DROP POLICY IF EXISTS "Enable delete for project owners" ON public.projects;

-- Create simple, non-recursive policies for projects
CREATE POLICY "Users can view projects they created" ON public.projects
FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Users can insert their own projects" ON public.projects
FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can update their own projects" ON public.projects
FOR UPDATE USING (auth.uid() = client_id)
WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can delete their own projects" ON public.projects
FOR DELETE USING (auth.uid() = client_id);

-- Fix user_roles policies to be simple
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles" ON public.user_roles
FOR SELECT USING (auth.uid() = user_id);
