
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type TaskBid = Database["public"]["Tables"]["task_bids"]["Row"];
type TaskBidInsert = Database["public"]["Tables"]["task_bids"]["Insert"];

interface TaskBidWithProfile extends TaskBid {
  profiles?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export const useTaskBids = (taskId?: string) => {
  const [bids, setBids] = useState<TaskBidWithProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchTaskBids = async () => {
    if (!taskId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('task_bids')
        .select(`
          *,
          profiles:bidder_id (
            first_name,
            last_name,
            email
          )
        `)
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBids(data || []);
    } catch (error) {
      console.error('Error fetching task bids:', error);
      toast({
        title: "Error",
        description: "Failed to load bids",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const submitBid = async (bidData: Omit<TaskBidInsert, 'bidder_id'>) => {
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('task_bids')
        .insert({
          ...bidData,
          bidder_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your bid has been submitted successfully!",
      });

      await fetchTaskBids(); // Refresh bids
      return data;
    } catch (error: any) {
      console.error('Error submitting bid:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit bid",
        variant: "destructive",
      });
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const updateBidStatus = async (bidId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('task_bids')
        .update({ status })
        .eq('id', bidId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Bid ${status} successfully`,
      });

      await fetchTaskBids(); // Refresh bids
    } catch (error: any) {
      console.error('Error updating bid status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update bid",
        variant: "destructive",
      });
    }
  };

  const getUserBid = (userId: string) => {
    return bids.find(bid => bid.bidder_id === userId);
  };

  useEffect(() => {
    fetchTaskBids();
  }, [taskId]);

  return {
    bids,
    loading,
    submitting,
    submitBid,
    updateBidStatus,
    getUserBid,
    refetch: fetchTaskBids,
  };
};
