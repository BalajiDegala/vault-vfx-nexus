
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DiscoveredMachine {
  id?: string;
  ip_address: string;
  hostname: string;
  name: string;
  status: 'online' | 'offline' | 'busy' | 'maintenance';
  capabilities: {
    cpu_cores: number;
    total_ram_gb: number;
    available_ram_gb: number;
    gpu_model?: string;
    gpu_memory_gb?: number;
    software_installed: string[];
    dcv_version?: string;
  };
  location: string;
  assigned_to?: string;
  assigned_by?: string;
  last_seen: string;
  utilization: {
    cpu_percent: number;
    memory_percent: number;
    gpu_percent?: number;
  };
}

export interface MachinePool {
  id: string;
  name: string;
  description: string;
  machines: DiscoveredMachine[];
  created_by: string;
  access_level: 'producer' | 'studio' | 'artist';
}

export const useMachineDiscovery = () => {
  const [discoveredMachines, setDiscoveredMachines] = useState<DiscoveredMachine[]>([]);
  const [machinePools, setMachinePools] = useState<MachinePool[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const { toast } = useToast();

  const scanNetworkRange = async (networkRange: string) => {
    setIsScanning(true);
    setScanProgress(0);
    
    try {
      const { data, error } = await supabase.functions.invoke('scan-network-machines', {
        body: { network_range: networkRange }
      });

      if (error) throw error;

      if (data.success) {
        setDiscoveredMachines(data.machines);
        toast({
          title: "Network Scan Complete",
          description: `Found ${data.machines.length} machines`,
        });
      }
    } catch (error: any) {
      console.error('Network scan error:', error);
      toast({
        title: "Scan Failed",
        description: error.message || "Failed to scan network",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
      setScanProgress(0);
    }
  };

  const registerMachine = async (machine: DiscoveredMachine) => {
    try {
      const { data, error } = await supabase.functions.invoke('register-machine', {
        body: { machine }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Machine Registered",
          description: `${machine.name} has been registered successfully`,
        });
        // Refresh machine list
        await fetchRegisteredMachines();
      }
    } catch (error: any) {
      console.error('Machine registration error:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register machine",
        variant: "destructive",
      });
    }
  };

  const assignMachine = async (machineId: string, userId: string, assignedBy: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('assign-machine', {
        body: { machine_id: machineId, user_id: userId, assigned_by: assignedBy }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Machine Assigned",
          description: "Machine has been assigned successfully",
        });
        await fetchRegisteredMachines();
      }
    } catch (error: any) {
      console.error('Machine assignment error:', error);
      toast({
        title: "Assignment Failed",
        description: error.message || "Failed to assign machine",
        variant: "destructive",
      });
    }
  };

  const fetchRegisteredMachines = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-registered-machines');
      
      if (error) throw error;
      
      if (data.success) {
        setDiscoveredMachines(data.machines);
      }
    } catch (error) {
      console.error('Error fetching registered machines:', error);
    }
  };

  const createMachinePool = async (name: string, description: string, machineIds: string[]) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-machine-pool', {
        body: { name, description, machine_ids: machineIds }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Machine Pool Created",
          description: `${name} pool created with ${machineIds.length} machines`,
        });
        await fetchMachinePools();
      }
    } catch (error: any) {
      console.error('Machine pool creation error:', error);
      toast({
        title: "Pool Creation Failed",
        description: error.message || "Failed to create machine pool",
        variant: "destructive",
      });
    }
  };

  const fetchMachinePools = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-machine-pools');
      
      if (error) throw error;
      
      if (data.success) {
        setMachinePools(data.pools);
      }
    } catch (error) {
      console.error('Error fetching machine pools:', error);
    }
  };

  useEffect(() => {
    fetchRegisteredMachines();
    fetchMachinePools();
  }, []);

  return {
    discoveredMachines,
    machinePools,
    isScanning,
    scanProgress,
    scanNetworkRange,
    registerMachine,
    assignMachine,
    createMachinePool,
    fetchRegisteredMachines,
    fetchMachinePools,
  };
};
