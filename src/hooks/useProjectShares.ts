import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';
import logger from "@/lib/logger";

type ProjectShare = Database["public"]["Tables"]["project_shares"]["Row"];
type ProjectShareInsert = Database["public"]["Tables"]["project_shares"]["Insert"];

interface ProjectShareWithProfiles extends ProjectShare {
  producer_profile?: {
    first_name: string;
    last_name: string;
    email: string;
    username: string;
  } | null;
  studio_profile?: {
    first_name: string;
    last_name: string;
    email: string;
    username: string;
  } | null;
  project?: {
    title: string;
    description: string;
    status: string;
  } | null;
}

export const useProjectShares = (userId?: string) => {
  const [shares, setShares] = useState<ProjectShareWithProfiles[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchProjectShares = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('project_shares')
        .select(`
          *,
          producer_profile:profiles!project_shares_producer_id_fkey(
            first_name,
            last_name,
            email,
            username
          ),
          studio_profile:profiles!project_shares_studio_id_fkey (
            first_name,
            last_name,
            email,
            username
          ),
          project:projects!project_shares_project_id_fkey (
            title,
            description,
            status
          )
        `)
        .or(`producer_id.eq.${userId},studio_id.eq.${userId}`)
        .order('shared_at', { ascending: false });

      if (error) throw error;
      
      setShares((data || []) as ProjectShareWithProfiles[]);
    } catch (error) {
      logger.error('Error fetching project shares:', error);
      toast({
        title: "Error",
        description: "Failed to load project shares",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const shareProject = async (shareData: Omit<ProjectShareInsert, 'producer_id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('project_shares')
        .insert({
          ...shareData,
          producer_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Project shared successfully with studio!",
      });

      await fetchProjectShares();
      return data;
    } catch (error: any) {
      logger.error('Error sharing project:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to share project",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateShareStatus = async (shareId: string, status: string, notes?: string) => {
    try {
      const updateData: any = { 
        status,
        responded_at: new Date().toISOString()
      };
      
      if (notes) {
        updateData.notes = notes;
      }

      const { error } = await supabase
        .from('project_shares')
        .update(updateData)
        .eq('id', shareId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Project share ${status} successfully`,
      });

      await fetchProjectShares();
    } catch (error: any) {
      logger.error('Error updating share status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update share",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchProjectShares();
  }, [userId]);

  return {
    shares,
    loading,
    shareProject,
    updateShareStatus,
    refetch: fetchProjectShares,
  };
};
