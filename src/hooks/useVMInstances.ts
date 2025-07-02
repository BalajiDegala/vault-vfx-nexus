import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

// This hook is deprecated - VFX Cloud Platform uses physical machines only
// Keeping minimal structure for backwards compatibility but no actual VM functionality

export interface VMInstance {
  id: string;
  vm_name: string;
  status: string;
  created_at: string;
}

export interface VMPlan {
  id: string;
  name: string;
  display_name: string;
  description: string;
}

export const useVMInstances = () => {
  const [vmInstances] = useState<VMInstance[]>([]);
  const [vmPlans] = useState<VMPlan[]>([]);
  const [loading] = useState(false);
  const { toast } = useToast();

  const launchVM = async () => {
    toast({
      title: "Feature Not Available",
      description: "VFX Cloud Platform uses physical machines only. Contact your producer for machine assignments.",
      variant: "destructive",
    });
    throw new Error('VM launching not supported in VFX Cloud Platform');
  };

  const terminateVM = async () => {
    toast({
      title: "Feature Not Available", 
      description: "VFX Cloud Platform uses physical machines only.",
      variant: "destructive",
    });
    throw new Error('VM termination not supported in VFX Cloud Platform');
  };

  const refetch = async () => {
    // No-op for compatibility
  };

  return {
    vmInstances,
    vmPlans,
    loading,
    launchVM,
    terminateVM,
    refetch,
  };
};
