
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface StorageAllocation {
  id: string;
  allocation_name: string;
  storage_type: string;
  size_gb: number;
  used_gb: number;
  monthly_rate: number;
  status: string;
  access_key: string;
  endpoint_url: string;
  created_at: string;
  terminated_at?: string;
}

export interface StoragePlan {
  id: string;
  name: string;
  display_name: string;
  description: string;
  storage_type: string;
  min_size_gb: number;
  max_size_gb: number;
  monthly_rate_per_gb: number;
  features: any[];
  is_active: boolean;
}

export const useStorageManagement = () => {
  const [allocations, setAllocations] = useState<StorageAllocation[]>([]);
  const [plans, setPlans] = useState<StoragePlan[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchAllocations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('storage_allocations')
        .select('*')
        .neq('status', 'terminated')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAllocations(data || []);
    } catch (error: any) {
      console.error('Error fetching allocations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch storage allocations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('storage_plans')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error: any) {
      console.error('Error fetching plans:', error);
      toast({
        title: "Error",
        description: "Failed to fetch storage plans",
        variant: "destructive",
      });
    }
  };

  const createAllocation = async (planName: string, allocationName: string, sizeGb: number) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-storage', {
        body: {
          action: 'create_allocation',
          storage_plan: planName,
          allocation_name: allocationName,
          size_gb: sizeGb
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Success",
          description: "Storage allocation created successfully",
        });
        await fetchAllocations();
        return data;
      } else {
        throw new Error(data.error || 'Failed to create allocation');
      }
    } catch (error: any) {
      console.error('Error creating allocation:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create storage allocation",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const terminateAllocation = async (allocationId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-storage', {
        body: {
          action: 'terminate_allocation',
          allocation_id: allocationId
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Success",
          description: "Storage allocation terminated successfully",
        });
        await fetchAllocations();
      } else {
        throw new Error('Failed to terminate allocation');
      }
    } catch (error: any) {
      console.error('Error terminating allocation:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to terminate storage allocation",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    allocations,
    plans,
    loading,
    fetchAllocations,
    fetchPlans,
    createAllocation,
    terminateAllocation,
  };
};
