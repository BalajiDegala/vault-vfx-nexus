import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type ProjectBid = Database["public"]["Tables"]["project_bids"]["Row"];
type ProjectBidInsert = Database["public"]["Tables"]["project_bids"]["Insert"];

interface ProjectBidWithProfile extends ProjectBid {
  bidder_profile?: {
    first_name: string;
    last_name: string;
    email: string;
    username: string;
  } | null;
  project?: {
    title: string;
    description: string;
  } | null;
}

export const useProjectBids = (projectId?: string) => {
  const [bids, setBids] = useState<ProjectBidWithProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchProjectBids = async () => {
    if (!projectId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('project_bids')
        .select(`
          *,
          bidder_profile:profiles (
            first_name,
            last_name,
            email,
            username
          ),
          project:projects (
            title,
            description
          )
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setBids((data || []) as ProjectBidWithProfile[]);
    } catch (error) {
      console.error('Error fetching project bids:', error);
      toast({
        title: "Error",
        description: "Failed to load project bids",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const submitProjectBid = async (bidData: Omit<ProjectBidInsert, 'bidder_id'>) => {
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('project_bids')
        .insert({
          ...bidData,
          bidder_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your project bid has been submitted successfully!",
      });

      await fetchProjectBids();
      return data;
    } catch (error: any) {
      console.error('Error submitting project bid:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit project bid",
        variant: "destructive",
      });
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const getUserBid = (userId: string) => {
    return bids.find(bid => bid.bidder_id === userId);
  };

  useEffect(() => {
    fetchProjectBids();
  }, [projectId]);

  return {
    bids,
    loading,
    submitting,
    submitProjectBid,
    getUserBid,
    refetch: fetchProjectBids,
  };
};
