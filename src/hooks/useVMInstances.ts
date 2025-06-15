
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface VMInstance {
  id: string;
  vm_name: string;
  vm_plan_name: string;
  status: string;
  cpu_cores: number;
  ram_gb: number;
  storage_gb: number;
  gpu_allocated: boolean;
  dcv_connection_url: string | null;
  hourly_rate: number;
  current_runtime_minutes?: number;
  current_cost?: number;
  estimated_hourly_cost?: number;
  created_at: string;
  physical_machines?: {
    name: string;
    location: string;
    gpu_model: string;
  };
}

export interface VMPlan {
  id: string;
  name: string;
  display_name: string;
  description: string;
  cpu_cores: number;
  ram_gb: number;
  storage_gb: number;
  gpu_included: boolean;
  gpu_model: string;
  hourly_rate: number;
  currency: string;
}

export const useVMInstances = () => {
  const [vmInstances, setVMInstances] = useState<VMInstance[]>([]);
  const [vmPlans, setVMPlans] = useState<VMPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchVMPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('vm_plans')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      setVMPlans(data || []);
    } catch (error) {
      console.error('Error fetching VM plans:', error);
      toast({
        title: "Error",
        description: "Failed to load VM plans",
        variant: "destructive",
      });
    }
  };

  const fetchVMInstances = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('get-vm-status');
      
      if (error) throw error;
      
      if (data.success) {
        setVMInstances(data.vm_instances || []);
      }
    } catch (error) {
      console.error('Error fetching VM instances:', error);
      toast({
        title: "Error",
        description: "Failed to load VM instances",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const launchVM = async (vmPlanName: string, vmName?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('launch-vm', {
        body: { vm_plan_name: vmPlanName, vm_name: vmName }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Success",
          description: data.message || "VM is being launched",
        });
        await fetchVMInstances();
        return data.vm_instance;
      } else {
        throw new Error(data.error || 'Failed to launch VM');
      }
    } catch (error: any) {
      console.error('Error launching VM:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to launch VM",
        variant: "destructive",
      });
      throw error;
    }
  };

  const terminateVM = async (vmInstanceId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('terminate-vm', {
        body: { vm_instance_id: vmInstanceId }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Success",
          description: "VM terminated successfully",
        });
        await fetchVMInstances();
      } else {
        throw new Error(data.error || 'Failed to terminate VM');
      }
    } catch (error: any) {
      console.error('Error terminating VM:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to terminate VM",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchVMPlans();
    fetchVMInstances();
  }, []);

  return {
    vmInstances,
    vmPlans,
    loading,
    launchVM,
    terminateVM,
    refetch: fetchVMInstances,
  };
};
