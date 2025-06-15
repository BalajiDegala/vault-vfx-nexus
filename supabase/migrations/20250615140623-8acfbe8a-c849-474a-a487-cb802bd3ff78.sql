
-- Create table for DCV sessions (needed for the DCV integration)
CREATE TABLE IF NOT EXISTS public.dcv_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vm_instance_id UUID NOT NULL REFERENCES public.vm_instances(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on dcv_sessions table
ALTER TABLE public.dcv_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for dcv_sessions
CREATE POLICY "Users can view their own DCV sessions"
  ON public.dcv_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own DCV sessions"
  ON public.dcv_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own DCV sessions"
  ON public.dcv_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_dcv_sessions_vm_instance_id ON public.dcv_sessions(vm_instance_id);
CREATE INDEX IF NOT EXISTS idx_dcv_sessions_user_id ON public.dcv_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_dcv_sessions_session_token ON public.dcv_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_dcv_sessions_expires_at ON public.dcv_sessions(expires_at);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_dcv_sessions_updated_at
  BEFORE UPDATE ON public.dcv_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
