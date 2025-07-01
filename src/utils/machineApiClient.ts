
import { supabase } from '@/integrations/supabase/client';
import { DiscoveredMachine, MachinePool } from '@/hooks/useMachineDiscovery';

// Debounce utility
function debounce<T extends (...args: any[]) => Promise<any>>(
  func: T,
  wait: number
): T {
  let timeout: NodeJS.Timeout;
  let lastPromise: Promise<any> | null = null;

  return ((...args: any[]) => {
    return new Promise((resolve, reject) => {
      clearTimeout(timeout);
      
      timeout = setTimeout(async () => {
        try {
          if (lastPromise) {
            await lastPromise;
          }
          lastPromise = func(...args);
          const result = await lastPromise;
          lastPromise = null;
          resolve(result);
        } catch (error) {
          lastPromise = null;
          reject(error);
        }
      }, wait);
    });
  }) as T;
}

// Request deduplication map
const pendingRequests = new Map<string, Promise<any>>();

// Deduplicated request helper
async function deduplicateRequest<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key) as Promise<T>;
  }

  const promise = requestFn().finally(() => {
    pendingRequests.delete(key);
  });

  pendingRequests.set(key, promise);
  return promise;
}

class MachineApiClient {
  private readonly DEBOUNCE_DELAY = 300;

  // Debounced methods
  private debouncedScanNetwork = debounce(this.scanNetworkInternal.bind(this), this.DEBOUNCE_DELAY);
  private debouncedFetchMachines = debounce(this.fetchMachinesInternal.bind(this), this.DEBOUNCE_DELAY);
  private debouncedFetchPools = debounce(this.fetchPoolsInternal.bind(this), this.DEBOUNCE_DELAY);

  async scanNetworkRange(networkRange: string) {
    return deduplicateRequest(`scan-${networkRange}`, () => 
      this.debouncedScanNetwork(networkRange)
    );
  }

  async fetchRegisteredMachines() {
    return deduplicateRequest('fetch-machines', () => 
      this.debouncedFetchMachines()
    );
  }

  async fetchMachinePools() {
    return deduplicateRequest('fetch-pools', () => 
      this.debouncedFetchPools()
    );
  }

  async registerMachine(machine: DiscoveredMachine) {
    return deduplicateRequest(`register-${machine.ip_address}`, async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Authentication required');
      }

      const { data, error } = await supabase.functions.invoke('register-machine', {
        body: { machine },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      return data;
    });
  }

  async assignMachine(machineId: string, userId: string, assignedBy: string) {
    return deduplicateRequest(`assign-${machineId}-${userId}`, async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Authentication required');
      }

      const { data, error } = await supabase.functions.invoke('assign-machine', {
        body: { machine_id: machineId, user_id: userId, assigned_by: assignedBy },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      return data;
    });
  }

  async createMachinePool(name: string, description: string, machineIds: string[]) {
    return deduplicateRequest(`create-pool-${name}`, async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Authentication required');
      }

      const { data, error } = await supabase.functions.invoke('create-machine-pool', {
        body: { name, description, machine_ids: machineIds },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      return data;
    });
  }

  // Private internal methods
  private async scanNetworkInternal(networkRange: string) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Authentication required');
    }

    const { data, error } = await supabase.functions.invoke('scan-network-machines', {
      body: { network_range: networkRange },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) throw error;
    return data;
  }

  private async fetchMachinesInternal() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.log('No session found, skipping machine fetch');
      return { success: true, machines: [] };
    }

    const { data, error } = await supabase.functions.invoke('get-registered-machines', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });
    
    if (error) {
      console.error('Edge function error:', error);
      throw error;
    }
    
    return data;
  }

  private async fetchPoolsInternal() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.log('No session found, skipping pools fetch');
      return { success: true, pools: [] };
    }

    const { data, error } = await supabase.functions.invoke('get-machine-pools', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });
    
    if (error) {
      console.error('Edge function error:', error);
      throw error;
    }
    
    return data;
  }
}

export const machineApiClient = new MachineApiClient();
