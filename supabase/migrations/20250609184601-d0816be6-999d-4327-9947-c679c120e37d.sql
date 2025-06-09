
-- First, disable RLS temporarily to clear all policies safely
ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on projects table (including any we might have missed)
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'projects' AND schemaname = 'public')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.projects';
    END LOOP;
END $$;

-- Re-enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create ONE simple policy for each operation - no complex logic
CREATE POLICY "projects_select_policy" ON public.projects
FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "projects_insert_policy" ON public.projects
FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "projects_update_policy" ON public.projects
FOR UPDATE USING (auth.uid() = client_id);

CREATE POLICY "projects_delete_policy" ON public.projects
FOR DELETE USING (auth.uid() = client_id);
