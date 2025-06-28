
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';
import logger from "@/lib/logger";

type ProjectBid = Database["public"]["Tables"]["project_bids"]["Row"];
type ProjectBidInsert = Database["public"]["Tables"]["project_bids"]["Insert"];

interface ProjectBidWithProfile extends ProjectBid {
  bidder_profile?: {
    first_name: string | null;
    last_name: string | null;
    email: string;
    username: string | null;
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
      // First, fetch the bids and the related project info
      const { data: bidsData, error: bidsError } = await supabase
        .from('project_bids')
        .select(`
          *,
          project:projects!project_id(
            title,
            description
          )
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (bidsError) {
        logger.error("Error fetching project bids:", bidsError);
        throw bidsError;
      }

      if (!bidsData || bidsData.length === 0) {
        setBids([]);
        setLoading(false);
        return;
      }
      
      // Extract bidder IDs to fetch profiles in a second query
      const bidderIds = bidsData.map(bid => bid.bidder_id).filter(id => id);

      if (bidderIds.length === 0) {
        setBids(bidsData as ProjectBidWithProfile[]);
        setLoading(false);
        return;
      }

      // Fetch profiles for all bidders
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, username')
        .in('id', bidderIds);

      if (profilesError) {
        logger.error("Error fetching bidder profiles:", profilesError);
        throw profilesError;
      }

      // Create a map for easy profile lookup
      const profilesMap = new Map(profilesData.map(p => [p.id, p]));
      
      // Combine bids with their bidder profiles
      const combinedBids = bidsData.map(bid => ({
        ...bid,
        bidder_profile: profilesMap.get(bid.bidder_id) || null,
      }));
      
      setBids(combinedBids as ProjectBidWithProfile[]);
    } catch (error) {
      logger.error('Error processing project bids:', error);
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
      logger.error('Error submitting project bid:', error);
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
