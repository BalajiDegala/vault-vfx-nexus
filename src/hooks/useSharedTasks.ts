
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SharedTask {
  id: string;
  task_id: string;
  studio_id: string;
  artist_id: string;
  status: 'pending' | 'approved' | 'rejected';
  shared_at: string;
  approved_at?: string;
  approved_by?: string;
  notes?: string;
  access_level: 'view' | 'edit' | 'comment';
  tasks?: {
    id: string;
    name: string;
    description: string;
    task_type: string;
    status: string;
    priority: string;
    estimated_hours?: number;
    shots?: {
      name: string;
      sequences?: {
        name: string;
        projects?: {
          title: string;
          project_code?: string;
        };
      };
    };
  };
  profiles?: {
    first_name: string;
    last_name: string;
  };
}

export const useSharedTasks = (userRole: string, userId: string) => {
  const [sharedTasks, setSharedTasks] = useState<SharedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) return;
    fetchSharedTasks();
  }, [userId, userRole]);

  const fetchSharedTasks = async () => {
    try {
      let query = supabase.from('shared_tasks').select(`
        *,
        tasks:task_id (
          id,
          name,
          description,
          task_type,
          status,
          priority,
          estimated_hours,
          shots:shot_id (
            name,
            sequences:sequence_id (
              name,
              projects:project_id (
                title,
                project_code
              )
            )
          )
        )
      `);

      if (userRole === 'artist') {
        query = query.eq('artist_id', userId).eq('status', 'approved');
      } else if (userRole === 'studio') {
        query = query.eq('studio_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch studio profiles separately
      const studioIds = (data || []).map(item => item.studio_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', studioIds);

      if (profilesError) throw profilesError;

      // Transform the data to match our interface
      const transformedData: SharedTask[] = (data || []).map(item => {
        const studioProfile = profiles?.find(p => p.id === item.studio_id);
        return {
          ...item,
          status: item.status as 'pending' | 'approved' | 'rejected',
          access_level: item.access_level as 'view' | 'edit' | 'comment',
          profiles: studioProfile ? {
            first_name: studioProfile.first_name || '',
            last_name: studioProfile.last_name || ''
          } : undefined
        };
      });
      
      setSharedTasks(transformedData);
    } catch (error) {
      console.error('Error fetching shared tasks:', error);
      toast({
        title: "Error",
        description: "Failed to load shared tasks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const shareTaskWithArtist = async (taskId: string, artistId: string, accessLevel: 'view' | 'edit' | 'comment' = 'view', notes?: string) => {
    try {
      const { error } = await supabase
        .from('shared_tasks')
        .insert({
          task_id: taskId,
          studio_id: userId,
          artist_id: artistId,
          access_level: accessLevel,
          notes,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Task shared with artist successfully",
      });

      fetchSharedTasks();
    } catch (error) {
      console.error('Error sharing task:', error);
      toast({
        title: "Error",
        description: "Failed to share task with artist",
        variant: "destructive",
      });
    }
  };

  const approveTaskAccess = async (sharedTaskId: string) => {
    try {
      const { error } = await supabase
        .from('shared_tasks')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: userId,
        })
        .eq('id', sharedTaskId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Task access approved",
      });

      fetchSharedTasks();
    } catch (error) {
      console.error('Error approving task access:', error);
      toast({
        title: "Error",
        description: "Failed to approve task access",
        variant: "destructive",
      });
    }
  };

  return {
    sharedTasks,
    loading,
    shareTaskWithArtist,
    approveTaskAccess,
    refetch: fetchSharedTasks,
  };
};
