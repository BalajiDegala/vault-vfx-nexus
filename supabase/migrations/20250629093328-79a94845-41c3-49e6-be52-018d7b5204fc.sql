
-- Create discovered_machines table for storing machine information
CREATE TABLE public.discovered_machines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address INET NOT NULL UNIQUE,
  hostname TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'online' CHECK (status IN ('online', 'offline', 'busy', 'maintenance')),
  capabilities JSONB NOT NULL DEFAULT '{}',
  location TEXT,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  utilization JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create machine_pools table for grouping machines
CREATE TABLE public.machine_pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_level TEXT NOT NULL DEFAULT 'studio' CHECK (access_level IN ('producer', 'studio', 'artist')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create machine_pool_assignments table for many-to-many relationship
CREATE TABLE public.machine_pool_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID NOT NULL REFERENCES public.machine_pools(id) ON DELETE CASCADE,
  machine_id UUID NOT NULL REFERENCES public.discovered_machines(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(pool_id, machine_id)
);

-- Create machine_assignments table for tracking individual assignments
CREATE TABLE public.machine_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_id UUID NOT NULL REFERENCES public.discovered_machines(id) ON DELETE CASCADE,
  assigned_to UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assignment_type TEXT NOT NULL CHECK (assignment_type IN ('studio', 'artist', 'pool')),
  duration_hours INTEGER,
  cost_per_hour NUMERIC(10,2),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create machine_utilization_logs table for performance tracking
CREATE TABLE public.machine_utilization_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_id UUID NOT NULL REFERENCES public.discovered_machines(id) ON DELETE CASCADE,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  cpu_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  memory_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  gpu_percent NUMERIC(5,2),
  active_sessions INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'
);

-- Enable Row Level Security
ALTER TABLE public.discovered_machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machine_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machine_pool_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machine_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machine_utilization_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for discovered_machines
CREATE POLICY "Producers and admins can manage all machines" 
  ON public.discovered_machines 
  FOR ALL 
  USING (public.has_role(auth.uid(), 'producer') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Studios can view machines assigned to them or their pool" 
  ON public.discovered_machines 
  FOR SELECT 
  USING (
    public.has_role(auth.uid(), 'studio') AND 
    (assigned_to = auth.uid() OR id IN (
      SELECT mpa.machine_id FROM machine_pool_assignments mpa
      JOIN machine_pools mp ON mpa.pool_id = mp.id
      WHERE mp.created_by = auth.uid()
    ))
  );

CREATE POLICY "Artists can view machines assigned to them" 
  ON public.discovered_machines 
  FOR SELECT 
  USING (public.has_role(auth.uid(), 'artist') AND assigned_to = auth.uid());

-- RLS Policies for machine_pools
CREATE POLICY "Producers and admins can manage all pools" 
  ON public.machine_pools 
  FOR ALL 
  USING (public.has_role(auth.uid(), 'producer') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Studios can view their own pools" 
  ON public.machine_pools 
  FOR SELECT 
  USING (public.has_role(auth.uid(), 'studio') AND created_by = auth.uid());

-- RLS Policies for machine_pool_assignments
CREATE POLICY "Pool creators can manage their pool assignments" 
  ON public.machine_pool_assignments 
  FOR ALL 
  USING (
    pool_id IN (
      SELECT id FROM machine_pools 
      WHERE created_by = auth.uid()
    ) OR 
    public.has_role(auth.uid(), 'producer') OR 
    public.has_role(auth.uid(), 'admin')
  );

-- RLS Policies for machine_assignments
CREATE POLICY "Users can view assignments involving them" 
  ON public.machine_assignments 
  FOR SELECT 
  USING (
    assigned_to = auth.uid() OR 
    assigned_by = auth.uid() OR 
    public.has_role(auth.uid(), 'producer') OR 
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Producers and studios can create assignments" 
  ON public.machine_assignments 
  FOR INSERT 
  WITH CHECK (
    public.has_role(auth.uid(), 'producer') OR 
    public.has_role(auth.uid(), 'studio') OR 
    public.has_role(auth.uid(), 'admin')
  );

-- RLS Policies for machine_utilization_logs
CREATE POLICY "Users can view utilization for accessible machines" 
  ON public.machine_utilization_logs 
  FOR SELECT 
  USING (
    machine_id IN (
      SELECT id FROM discovered_machines 
      WHERE assigned_to = auth.uid()
    ) OR 
    public.has_role(auth.uid(), 'producer') OR 
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'studio')
  );

-- Create indexes for better performance
CREATE INDEX idx_discovered_machines_status ON public.discovered_machines(status);
CREATE INDEX idx_discovered_machines_assigned_to ON public.discovered_machines(assigned_to);
CREATE INDEX idx_machine_assignments_assigned_to ON public.machine_assignments(assigned_to);
CREATE INDEX idx_machine_assignments_machine_id ON public.machine_assignments(machine_id);
CREATE INDEX idx_machine_utilization_logs_machine_id ON public.machine_utilization_logs(machine_id);
CREATE INDEX idx_machine_utilization_logs_recorded_at ON public.machine_utilization_logs(recorded_at);

-- Enable realtime for live updates
ALTER TABLE public.discovered_machines REPLICA IDENTITY FULL;
ALTER TABLE public.machine_assignments REPLICA IDENTITY FULL;
ALTER TABLE public.machine_utilization_logs REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.discovered_machines;
ALTER PUBLICATION supabase_realtime ADD TABLE public.machine_assignments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.machine_utilization_logs;

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_discovered_machines_updated_at 
  BEFORE UPDATE ON public.discovered_machines 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_machine_pools_updated_at 
  BEFORE UPDATE ON public.machine_pools 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
