
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';
import logger from "@/lib/logger";

type TaskAssignment = Database["public"]["Tables"]["task_assignments"]["Row"];
type TaskAssignmentInsert = Database["public"]["Tables"]["task_assignments"]["Insert"];

interface TaskAssignmentWithProfiles extends TaskAssignment {
  artist_profile?: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  studio_profile?: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  task_bids?: {
    amount: number;
    currency: string;
    proposal: string;
  } | null;
}

export const useTaskAssignments = (userId?: string) => {
  const [assignments, setAssignments] = useState<TaskAssignmentWithProfiles[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchAssignments = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('task_assignments')
        .select(`
          *,
          artist_profile:profiles!task_assignments_artist_id_fkey (
            first_name,
            last_name,
            email
          ),
          studio_profile:profiles!task_assignments_studio_id_fkey (
            first_name,
            last_name,
            email
          ),
          task_bids:task_bids!task_assignments_bid_id_fkey (
            amount,
            currency,
            proposal
          )
        `)
        .or(`artist_id.eq.${userId},studio_id.eq.${userId}`)
        .order('assigned_at', { ascending: false });

      if (error) throw error;
      
      // Type assertion to ensure compatibility
      const typedData = (data || []) as TaskAssignmentWithProfiles[];
      setAssignments(typedData);
    } catch (error) {
      logger.error('Error fetching task assignments:', error);
      toast({
        title: "Error",
        description: "Failed to load assignments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createAssignment = async (assignmentData: Omit<TaskAssignmentInsert, 'studio_id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('task_assignments')
        .insert({
          ...assignmentData,
          studio_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Task assigned successfully!",
      });

      await fetchAssignments(); // Refresh assignments
      return data;
    } catch (error: any) {
      logger.error('Error creating assignment:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create assignment",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateAssignmentStatus = async (assignmentId: string, status: string, notes?: string) => {
    try {
      const updateData: any = { status };
      
      if (status === 'in_progress' && !assignments.find(a => a.id === assignmentId)?.start_date) {
        updateData.start_date = new Date().toISOString();
      }
      
      if (status === 'completed') {
        updateData.completed_date = new Date().toISOString();
      }
      
      if (notes) {
        updateData.notes = notes;
      }

      const { error } = await supabase
        .from('task_assignments')
        .update(updateData)
        .eq('id', assignmentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Assignment status updated to ${status}`,
      });

      await fetchAssignments(); // Refresh assignments
    } catch (error: any) {
      logger.error('Error updating assignment status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update assignment",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [userId]);

  return {
    assignments,
    loading,
    createAssignment,
    updateAssignmentStatus,
    refetch: fetchAssignments,
  };
};
