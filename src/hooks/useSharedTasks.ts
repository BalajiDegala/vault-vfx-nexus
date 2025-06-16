
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
      console.log('Fetching shared tasks for user:', userId, 'role:', userRole);
      
      let query = supabase.from('shared_tasks').select(`
        *,
        tasks!inner (
          id,
          name,
          description,
          task_type,
          status,
          priority,
          estimated_hours,
          shots (
            name,
            sequences (
              name,
              projects (
                title,
                project_code
              )
            )
          )
        )
      `);

      if (userRole === 'artist') {
        query = query.eq('artist_id', userId);
        console.log('Artist query - looking for artist_id:', userId);
      } else if (userRole === 'studio') {
        query = query.eq('studio_id', userId);
        console.log('Studio query - looking for studio_id:', userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Supabase error:', error);
        toast({
          title: "Error",
          description: "Failed to fetch shared tasks",
          variant: "destructive",
        });
        setSharedTasks([]);
        return;
      }

      console.log('Raw shared tasks data:', data);
      console.log('Number of shared tasks found:', data?.length || 0);

      if (!data || data.length === 0) {
        console.log('No shared tasks found for this user');
        setSharedTasks([]);
        return;
      }

      // Get profile IDs based on user role
      let profileIds: string[] = [];
      if (userRole === 'artist') {
        // For artists, show studio profiles (who shared the task)
        profileIds = [...new Set(data.map(item => item.studio_id))].filter(Boolean);
      } else if (userRole === 'studio') {
        // For studios, show artist profiles (who the task was shared with)
        profileIds = [...new Set(data.map(item => item.artist_id))].filter(Boolean);
      }
      
      let profiles: any[] = [];
      if (profileIds.length > 0) {
        console.log('Fetching profiles for IDs:', profileIds);
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', profileIds);
        
        profiles = profilesData || [];
        console.log('Fetched profiles:', profiles);
      }

      // Transform the data to match our interface
      const transformedData: SharedTask[] = data.map(item => {
        let profileToShow;
        
        if (userRole === 'artist') {
          // For artists, show studio profile (who shared the task)
          profileToShow = profiles.find(p => p.id === item.studio_id);
        } else if (userRole === 'studio') {
          // For studios, show artist profile (who the task was shared with)
          profileToShow = profiles.find(p => p.id === item.artist_id);
        }
        
        console.log('Processing shared task:', item.id, 'with task:', item.tasks?.name, 'status:', item.status);
        
        return {
          id: item.id,
          task_id: item.task_id,
          studio_id: item.studio_id,
          artist_id: item.artist_id,
          status: item.status as 'pending' | 'approved' | 'rejected',
          shared_at: item.shared_at,
          approved_at: item.approved_at,
          approved_by: item.approved_by,
          notes: item.notes,
          access_level: item.access_level as 'view' | 'edit' | 'comment',
          tasks: item.tasks,
          profiles: profileToShow ? {
            first_name: profileToShow.first_name || '',
            last_name: profileToShow.last_name || ''
          } : undefined
        };
      });
      
      console.log('Final transformed shared tasks:', transformedData);
      setSharedTasks(transformedData);
    } catch (error) {
      console.error('Error fetching shared tasks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch shared tasks",
        variant: "destructive",
      });
      setSharedTasks([]);
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
