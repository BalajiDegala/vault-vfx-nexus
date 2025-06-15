
-- Physical machines table to track available hardware
CREATE TABLE public.physical_machines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  hostname TEXT NOT NULL UNIQUE,
  ip_address INET NOT NULL,
  status TEXT NOT NULL DEFAULT 'online' CHECK (status IN ('online', 'offline', 'maintenance')),
  cpu_cores INTEGER NOT NULL,
  total_ram_gb INTEGER NOT NULL,
  available_ram_gb INTEGER NOT NULL,
  total_storage_gb INTEGER NOT NULL,
  available_storage_gb INTEGER NOT NULL,
  gpu_model TEXT,
  gpu_memory_gb INTEGER,
  dcv_enabled BOOLEAN DEFAULT true,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- VM instances table
CREATE TABLE public.vm_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  physical_machine_id UUID NOT NULL REFERENCES physical_machines(id),
  vm_plan_name TEXT NOT NULL,
  vm_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'provisioning' CHECK (status IN ('provisioning', 'running', 'stopped', 'terminated', 'error')),
  cpu_cores INTEGER NOT NULL,
  ram_gb INTEGER NOT NULL,
  storage_gb INTEGER NOT NULL,
  gpu_allocated BOOLEAN DEFAULT false,
  dcv_session_id TEXT,
  dcv_connection_url TEXT,
  hourly_rate NUMERIC NOT NULL,
  total_cost NUMERIC DEFAULT 0,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  terminated_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(physical_machine_id, vm_name)
);

-- VM usage tracking for billing
CREATE TABLE public.vm_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vm_instance_id UUID NOT NULL REFERENCES vm_instances(id),
  user_id UUID NOT NULL REFERENCES profiles(id),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  hourly_rate NUMERIC NOT NULL,
  cost NUMERIC,
  status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'billed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Storage allocations table
CREATE TABLE public.storage_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  allocation_name TEXT NOT NULL,
  storage_type TEXT NOT NULL DEFAULT 's3' CHECK (storage_type IN ('s3', 'block', 'file')),
  size_gb INTEGER NOT NULL,
  used_gb INTEGER DEFAULT 0,
  monthly_rate NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'terminated')),
  endpoint_url TEXT,
  access_key TEXT,
  secret_key TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  terminated_at TIMESTAMP WITH TIME ZONE
);

-- Storage usage tracking
CREATE TABLE public.storage_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_allocation_id UUID NOT NULL REFERENCES storage_allocations(id),
  user_id UUID NOT NULL REFERENCES profiles(id),
  date DATE NOT NULL,
  used_gb INTEGER NOT NULL,
  monthly_rate NUMERIC NOT NULL,
  daily_cost NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(storage_allocation_id, date)
);

-- VM plans configuration
CREATE TABLE public.vm_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  cpu_cores INTEGER NOT NULL,
  ram_gb INTEGER NOT NULL,
  storage_gb INTEGER NOT NULL,
  gpu_included BOOLEAN DEFAULT false,
  gpu_model TEXT,
  hourly_rate NUMERIC NOT NULL,
  currency TEXT DEFAULT 'V3C',
  max_instances_per_user INTEGER DEFAULT 5,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Storage plans configuration
CREATE TABLE public.storage_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  storage_type TEXT NOT NULL CHECK (storage_type IN ('s3', 'block', 'file')),
  min_size_gb INTEGER NOT NULL,
  max_size_gb INTEGER NOT NULL,
  monthly_rate_per_gb NUMERIC NOT NULL,
  currency TEXT DEFAULT 'V3C',
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Billing records for infrastructure usage
CREATE TABLE public.infrastructure_billing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  billing_type TEXT NOT NULL CHECK (billing_type IN ('vm', 'storage')),
  resource_id UUID NOT NULL, -- vm_instance_id or storage_allocation_id
  billing_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  billing_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  usage_amount NUMERIC NOT NULL, -- hours for VM, GB-days for storage
  rate NUMERIC NOT NULL,
  total_cost NUMERIC NOT NULL,
  currency TEXT DEFAULT 'V3C',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'charged', 'failed')),
  transaction_id UUID REFERENCES v3c_transactions(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  charged_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on all tables
ALTER TABLE public.physical_machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vm_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vm_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vm_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.infrastructure_billing ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Physical machines - only admins can see
CREATE POLICY "Admins can view physical machines" ON public.physical_machines
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins can manage physical machines" ON public.physical_machines
  FOR ALL USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- VM instances - users can only see their own
CREATE POLICY "Users can view their own VMs" ON public.vm_instances
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own VMs" ON public.vm_instances
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own VMs" ON public.vm_instances
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can view all VMs" ON public.vm_instances
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- VM usage logs - users can only see their own
CREATE POLICY "Users can view their own VM usage" ON public.vm_usage_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert VM usage logs" ON public.vm_usage_logs
  FOR INSERT WITH CHECK (true);

-- Storage allocations - users can only see their own
CREATE POLICY "Users can view their own storage" ON public.storage_allocations
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own storage" ON public.storage_allocations
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own storage" ON public.storage_allocations
  FOR UPDATE USING (user_id = auth.uid());

-- Storage usage logs - users can only see their own
CREATE POLICY "Users can view their own storage usage" ON public.storage_usage_logs
  FOR SELECT USING (user_id = auth.uid());

-- VM and Storage plans - everyone can read active plans
CREATE POLICY "Everyone can view active VM plans" ON public.vm_plans
  FOR SELECT USING (is_active = true);

CREATE POLICY "Everyone can view active storage plans" ON public.storage_plans
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage VM plans" ON public.vm_plans
  FOR ALL USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins can manage storage plans" ON public.storage_plans
  FOR ALL USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Infrastructure billing - users can only see their own
CREATE POLICY "Users can view their own billing" ON public.infrastructure_billing
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can manage billing records" ON public.infrastructure_billing
  FOR ALL WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_vm_instances_user_id ON public.vm_instances(user_id);
CREATE INDEX idx_vm_instances_physical_machine_id ON public.vm_instances(physical_machine_id);
CREATE INDEX idx_vm_instances_status ON public.vm_instances(status);
CREATE INDEX idx_vm_usage_logs_vm_instance_id ON public.vm_usage_logs(vm_instance_id);
CREATE INDEX idx_vm_usage_logs_user_id ON public.vm_usage_logs(user_id);
CREATE INDEX idx_storage_allocations_user_id ON public.storage_allocations(user_id);
CREATE INDEX idx_storage_usage_logs_allocation_id ON public.storage_usage_logs(storage_allocation_id);
CREATE INDEX idx_infrastructure_billing_user_id ON public.infrastructure_billing(user_id);
CREATE INDEX idx_infrastructure_billing_status ON public.infrastructure_billing(status);

-- Insert sample VM plans
INSERT INTO public.vm_plans (name, display_name, description, cpu_cores, ram_gb, storage_gb, gpu_included, gpu_model, hourly_rate, sort_order) VALUES
('basic-vfx', 'Basic VFX', 'Perfect for basic compositing and motion graphics', 8, 32, 500, true, 'RTX 3060', 50, 1),
('pro-studio', 'Pro Studio', 'High-performance for complex VFX and 3D rendering', 16, 64, 1000, true, 'RTX 4080', 120, 2),
('enterprise-render', 'Enterprise Render', 'Maximum power for large-scale productions', 32, 128, 2000, true, 'RTX 4090', 250, 3);

-- Insert sample storage plans
INSERT INTO public.storage_plans (name, display_name, description, storage_type, min_size_gb, max_size_gb, monthly_rate_per_gb, sort_order) VALUES
('s3-standard', 'Standard S3 Storage', 'General purpose object storage', 's3', 10, 10000, 0.5, 1),
('s3-performance', 'High Performance S3', 'Fast access object storage for active projects', 's3', 50, 5000, 1.0, 2),
('block-storage', 'Block Storage', 'High-speed block storage for databases and applications', 'block', 20, 2000, 2.0, 3);

-- Insert sample physical machine (for testing)
INSERT INTO public.physical_machines (name, hostname, ip_address, cpu_cores, total_ram_gb, available_ram_gb, total_storage_gb, available_storage_gb, gpu_model, gpu_memory_gb, location) VALUES
('render-node-01', 'render01.local', '192.168.1.100', 64, 256, 256, 4000, 4000, 'RTX 4090', 24, 'Datacenter-A'),
('render-node-02', 'render02.local', '192.168.1.101', 48, 128, 128, 2000, 2000, 'RTX 4080', 16, 'Datacenter-A');

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_physical_machines_updated_at BEFORE UPDATE ON public.physical_machines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vm_plans_updated_at BEFORE UPDATE ON public.vm_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
