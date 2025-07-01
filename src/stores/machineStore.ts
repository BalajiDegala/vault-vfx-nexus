
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { DiscoveredMachine, MachinePool } from '@/hooks/useMachineDiscovery';

interface MachineState {
  // Data
  discoveredMachines: DiscoveredMachine[];
  machinePools: MachinePool[];
  
  // Loading states
  isLoading: boolean;
  isScanning: boolean;
  scanProgress: number;
  
  // Error states
  error: string | null;
  lastFetch: number;
  
  // Cache control
  cacheExpiry: number;
  requestInProgress: Set<string>;
  
  // Actions
  setDiscoveredMachines: (machines: DiscoveredMachine[]) => void;
  setMachinePools: (pools: MachinePool[]) => void;
  setLoading: (loading: boolean) => void;
  setScanning: (scanning: boolean, progress?: number) => void;
  setError: (error: string | null) => void;
  addRequestInProgress: (key: string) => void;
  removeRequestInProgress: (key: string) => void;
  isRequestInProgress: (key: string) => boolean;
  shouldRefresh: () => boolean;
  clearCache: () => void;
}

export const useMachineStore = create<MachineState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    discoveredMachines: [],
    machinePools: [],
    isLoading: false,
    isScanning: false,
    scanProgress: 0,
    error: null,
    lastFetch: 0,
    cacheExpiry: 5 * 60 * 1000, // 5 minutes
    requestInProgress: new Set(),
    
    // Actions
    setDiscoveredMachines: (machines) => set({ 
      discoveredMachines: machines, 
      lastFetch: Date.now(),
      error: null
    }),
    
    setMachinePools: (pools) => set({ 
      machinePools: pools, 
      lastFetch: Date.now(),
      error: null
    }),
    
    setLoading: (loading) => set({ isLoading: loading }),
    
    setScanning: (scanning, progress = 0) => set({ 
      isScanning: scanning, 
      scanProgress: progress || 0 
    }),
    
    setError: (error) => set({ error }),
    
    addRequestInProgress: (key) => set((state) => ({
      requestInProgress: new Set([...state.requestInProgress, key])
    })),
    
    removeRequestInProgress: (key) => set((state) => {
      const newSet = new Set(state.requestInProgress);
      newSet.delete(key);
      return { requestInProgress: newSet };
    }),
    
    isRequestInProgress: (key) => get().requestInProgress.has(key),
    
    shouldRefresh: () => {
      const { lastFetch, cacheExpiry } = get();
      return Date.now() - lastFetch > cacheExpiry;
    },
    
    clearCache: () => set({ 
      lastFetch: 0, 
      discoveredMachines: [], 
      machinePools: [] 
    })
  }))
);
