
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useMachineStore } from '@/stores/machineStore';
import { machineApiClient } from '@/utils/machineApiClient';
import { tabSyncManager } from '@/utils/tabSync';

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

// Type guards for API responses
interface ScanNetworkResponse {
  success: boolean;
  machines?: DiscoveredMachine[];
}

interface FetchMachinesResponse {
  success: boolean;
  machines?: DiscoveredMachine[];
}

interface FetchPoolsResponse {
  success: boolean;
  pools?: MachinePool[];
}

interface RegisterMachineResponse {
  success: boolean;
}

interface AssignMachineResponse {
  success: boolean;
}

interface CreatePoolResponse {
  success: boolean;
}

function isScanNetworkResponse(data: unknown): data is ScanNetworkResponse {
  return typeof data === 'object' && data !== null && 'success' in data;
}

function isFetchMachinesResponse(data: unknown): data is FetchMachinesResponse {
  return typeof data === 'object' && data !== null && 'success' in data;
}

function isFetchPoolsResponse(data: unknown): data is FetchPoolsResponse {
  return typeof data === 'object' && data !== null && 'success' in data;
}

function isRegisterMachineResponse(data: unknown): data is RegisterMachineResponse {
  return typeof data === 'object' && data !== null && 'success' in data;
}

function isAssignMachineResponse(data: unknown): data is AssignMachineResponse {
  return typeof data === 'object' && data !== null && 'success' in data;
}

function isCreatePoolResponse(data: unknown): data is CreatePoolResponse {
  return typeof data === 'object' && data !== null && 'success' in data;
}

export const useMachineDiscovery = () => {
  const { toast } = useToast();
  const [isInitialized, setIsInitialized] = useState(false);
  const channelRef = useRef<any>(null);
  const initializationRef = useRef(false);
  
  // Get state and actions from store
  const {
    discoveredMachines,
    machinePools,
    isLoading,
    isScanning,
    scanProgress,
    error,
    setDiscoveredMachines,
    setMachinePools,
    setLoading,
    setScanning,
    setError,
    addRequestInProgress,
    removeRequestInProgress,
    isRequestInProgress,
    shouldRefresh
  } = useMachineStore();

  // Unique session identifier for realtime channels
  const sessionId = useRef(`session-${tabSyncManager.getTabId()}`);

  const scanNetworkRange = useCallback(async (networkRange: string) => {
    const requestKey = `scan-${networkRange}`;
    
    if (isRequestInProgress(requestKey)) {
      console.log('Scan already in progress, skipping...');
      return;
    }

    setScanning(true, 0);
    setError(null);
    addRequestInProgress(requestKey);
    
    try {
      const data = await machineApiClient.scanNetworkRange(networkRange);

      if (isScanNetworkResponse(data) && data.success) {
        // Simulate progress for better UX
        for (let i = 0; i <= 100; i += 20) {
          setScanning(true, i);
          await new Promise(resolve => setTimeout(resolve, 200));
        }

        toast({
          title: "Network Scan Complete",
          description: `Found ${data.machines?.length || 0} machines`,
        });

        // Add scanned machines to the discovered list without registering
        if (data.machines) {
          setDiscoveredMachines(prev => {
            const newMachines = data.machines!.filter((machine: DiscoveredMachine) => 
              !prev.some(existing => existing.ip_address === machine.ip_address)
            );
            const updated = [...prev, ...newMachines];
            
            // Broadcast to other tabs
            tabSyncManager.broadcast('MACHINES_UPDATED', updated);
            return updated;
          });
        }
      }
    } catch (error: any) {
      console.error('Network scan error:', error);
      setError(error.message || "Failed to scan network");
      toast({
        title: "Scan Failed",
        description: error.message || "Failed to scan network",
        variant: "destructive",
      });
    } finally {
      setScanning(false, 0);
      removeRequestInProgress(requestKey);
    }
  }, [isRequestInProgress, addRequestInProgress, removeRequestInProgress, setScanning, setError, setDiscoveredMachines, toast]);

  const registerMachine = useCallback(async (machine: DiscoveredMachine) => {
    const requestKey = `register-${machine.ip_address}`;
    
    if (isRequestInProgress(requestKey)) {
      console.log('Registration already in progress, skipping...');
      return;
    }

    addRequestInProgress(requestKey);
    
    try {
      const data = await machineApiClient.registerMachine(machine);

      if (isRegisterMachineResponse(data) && data.success) {
        toast({
          title: "Machine Registered",
          description: `${machine.name} has been registered successfully`,
        });
        await fetchRegisteredMachines();
      }
    } catch (error: any) {
      console.error('Machine registration error:', error);
      setError(error.message || "Failed to register machine");
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register machine",
        variant: "destructive",
      });
    } finally {
      removeRequestInProgress(requestKey);
    }
  }, [isRequestInProgress, addRequestInProgress, removeRequestInProgress, setError, toast]);

  const assignMachine = useCallback(async (machineId: string, userId: string, assignedBy: string) => {
    const requestKey = `assign-${machineId}-${userId}`;
    
    if (isRequestInProgress(requestKey)) {
      console.log('Assignment already in progress, skipping...');
      return;
    }

    addRequestInProgress(requestKey);
    
    try {
      const data = await machineApiClient.assignMachine(machineId, userId, assignedBy);

      if (isAssignMachineResponse(data) && data.success) {
        toast({
          title: "Machine Assigned",
          description: "Machine has been assigned successfully",
        });
        await fetchRegisteredMachines();
      }
    } catch (error: any) {
      console.error('Machine assignment error:', error);
      setError(error.message || "Failed to assign machine");
      toast({
        title: "Assignment Failed",
        description: error.message || "Failed to assign machine",
        variant: "destructive",
      });
    } finally {
      removeRequestInProgress(requestKey);
    }
  }, [isRequestInProgress, addRequestInProgress, removeRequestInProgress, setError, toast]);

  const fetchRegisteredMachines = useCallback(async () => {
    const requestKey = 'fetch-machines';
    
    if (isRequestInProgress(requestKey)) {
      console.log('Fetch machines already in progress, skipping...');
      return;
    }

    // Check if we should refresh based on cache
    if (!shouldRefresh() && discoveredMachines.length > 0) {
      console.log('Using cached machine data');
      return;
    }

    addRequestInProgress(requestKey);
    setLoading(true);
    setError(null);
    
    try {
      const data = await machineApiClient.fetchRegisteredMachines();
      
      if (isFetchMachinesResponse(data) && data.success && data.machines) {
        setDiscoveredMachines(data.machines);
        // Broadcast to other tabs
        tabSyncManager.broadcast('MACHINES_UPDATED', data.machines);
      }
    } catch (error: any) {
      console.error('Error fetching registered machines:', error);
      setError(error.message || "Failed to fetch machines");
    } finally {
      setLoading(false);
      removeRequestInProgress(requestKey);
    }
  }, [isRequestInProgress, addRequestInProgress, removeRequestInProgress, shouldRefresh, discoveredMachines.length, setLoading, setError, setDiscoveredMachines]);

  const createMachinePool = useCallback(async (name: string, description: string, machineIds: string[]) => {
    const requestKey = `create-pool-${name}`;
    
    if (isRequestInProgress(requestKey)) {
      console.log('Pool creation already in progress, skipping...');
      return;
    }

    addRequestInProgress(requestKey);
    
    try {
      const data = await machineApiClient.createMachinePool(name, description, machineIds);

      if (isCreatePoolResponse(data) && data.success) {
        toast({
          title: "Machine Pool Created",
          description: `${name} pool created with ${machineIds.length} machines`,
        });
        await fetchMachinePools();
      }
    } catch (error: any) {
      console.error('Machine pool creation error:', error);
      setError(error.message || "Failed to create machine pool");
      toast({
        title: "Pool Creation Failed",
        description: error.message || "Failed to create machine pool",
        variant: "destructive",
      });
    } finally {
      removeRequestInProgress(requestKey);
    }
  }, [isRequestInProgress, addRequestInProgress, removeRequestInProgress, setError, toast]);

  const fetchMachinePools = useCallback(async () => {
    const requestKey = 'fetch-pools';
    
    if (isRequestInProgress(requestKey)) {
      console.log('Fetch pools already in progress, skipping...');
      return;
    }

    // Check if we should refresh based on cache
    if (!shouldRefresh() && machinePools.length > 0) {
      console.log('Using cached pool data');
      return;
    }

    addRequestInProgress(requestKey);
    setLoading(true);
    setError(null);
    
    try {
      const data = await machineApiClient.fetchMachinePools();
      
      if (isFetchPoolsResponse(data) && data.success && data.pools) {
        setMachinePools(data.pools);
        // Broadcast to other tabs
        tabSyncManager.broadcast('POOLS_UPDATED', data.pools);
      }
    } catch (error: any) {
      console.error('Error fetching machine pools:', error);
      setError(error.message || "Failed to fetch pools");
    } finally {
      setLoading(false);
      removeRequestInProgress(requestKey);
    }
  }, [isRequestInProgress, addRequestInProgress, removeRequestInProgress, shouldRefresh, machinePools.length, setLoading, setError, setMachinePools]);

  // Set up realtime subscriptions with unique channel names
  useEffect(() => {
    if (initializationRef.current) return;
    
    let machinesChannel: any = null;
    let poolsChannel: any = null;

    const setupChannels = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Use unique channel names to prevent conflicts
      const machinesChannelName = `discovered-machines-changes-${sessionId.current}`;
      const poolsChannelName = `machine-pools-changes-${sessionId.current}`;

      machinesChannel = supabase
        .channel(machinesChannelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'discovered_machines'
          },
          () => {
            console.log('Machine data changed, refreshing...');
            fetchRegisteredMachines();
          }
        )
        .subscribe();

      poolsChannel = supabase
        .channel(poolsChannelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'machine_pools'
          },
          () => {
            console.log('Pool data changed, refreshing...');
            fetchMachinePools();
          }
        )
        .subscribe();

      channelRef.current = { machinesChannel, poolsChannel };
    };

    setupChannels();
    initializationRef.current = true;

    return () => {
      if (channelRef.current) {
        const { machinesChannel, poolsChannel } = channelRef.current;
        if (machinesChannel) supabase.removeChannel(machinesChannel);
        if (poolsChannel) supabase.removeChannel(poolsChannel);
      }
    };
  }, [fetchRegisteredMachines, fetchMachinePools]);

  // Set up tab synchronization
  useEffect(() => {
    // Listen for updates from other tabs
    tabSyncManager.subscribe('MACHINES_UPDATED', (machines) => {
      setDiscoveredMachines(machines);
    });

    tabSyncManager.subscribe('POOLS_UPDATED', (pools) => {
      setMachinePools(pools);
    });

    tabSyncManager.subscribe('CACHE_CLEAR', () => {
      setDiscoveredMachines([]);
      setMachinePools([]);
    });

    return () => {
      tabSyncManager.unsubscribe('MACHINES_UPDATED');
      tabSyncManager.unsubscribe('POOLS_UPDATED');
      tabSyncManager.unsubscribe('CACHE_CLEAR');
    };
  }, [setDiscoveredMachines, setMachinePools]);

  // Initial data fetch with proper dependency management
  useEffect(() => {
    const initializeData = async () => {
      if (isInitialized) return;
      
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsInitialized(true);
        await Promise.all([
          fetchRegisteredMachines(),
          fetchMachinePools()
        ]);
      }
    };

    initializeData();
  }, [isInitialized, fetchRegisteredMachines, fetchMachinePools]);

  return {
    discoveredMachines,
    machinePools,
    isScanning,
    scanProgress,
    isLoading,
    error,
    scanNetworkRange,
    registerMachine,
    assignMachine,
    createMachinePool,
    fetchRegisteredMachines,
    fetchMachinePools,
  };
};
