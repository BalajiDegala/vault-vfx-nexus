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
    if (!userId) {
      console.log('useSharedTasks: No userId provided');
      return;
    }
    console.log('useSharedTasks: Starting fetch with userId:', userId, 'userRole:', userRole);
    fetchSharedTasks();
  }, [userId, userRole]);

  const fetchSharedTasks = async () => {
    try {
      console.log('=== FETCHING SHARED TASKS ===');
      console.log('User ID:', userId);
      console.log('User Role:', userRole);
      
      // First, let's check if there are ANY shared tasks in the database
      const { data: allSharedTasks, error: countError } = await supabase
        .from('shared_tasks')
        .select('*');
      
      console.log('Total shared tasks in database:', allSharedTasks?.length || 0);
      console.log('All shared tasks:', allSharedTasks);

      // Now let's build our specific query
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
        console.log('Building artist query for artist_id:', userId);
        query = query.eq('artist_id', userId);
      } else if (userRole === 'studio') {
        console.log('Building studio query for studio_id:', userId);
        query = query.eq('studio_id', userId);
      }

      console.log('Executing query...');
      const { data, error } = await query;

      console.log('Query completed');
      console.log('Error:', error);
      console.log('Data:', data);
      console.log('Data length:', data?.length || 0);

      if (error) {
        console.error('Supabase query error:', error);
        toast({
          title: "Error",
          description: "Failed to fetch shared tasks",
          variant: "destructive",
        });
        setSharedTasks([]);
        return;
      }

      if (!data || data.length === 0) {
        console.log('No shared tasks found for this user');
        console.log('Checking if user exists in shared_tasks table...');
        
        // Let's check if this user appears anywhere in shared_tasks
        const { data: userCheck } = await supabase
          .from('shared_tasks')
          .select('*')
          .or(`artist_id.eq.${userId},studio_id.eq.${userId}`);
        
        console.log('User appears in shared_tasks:', userCheck?.length || 0, 'times');
        console.log('User shared_tasks data:', userCheck);
        
        setSharedTasks([]);
        return;
      }

      console.log('Processing', data.length, 'shared tasks...');

      // Get profile IDs based on user role
      let profileIds: string[] = [];
      if (userRole === 'artist') {
        profileIds = [...new Set(data.map(item => item.studio_id))].filter(Boolean);
        console.log('Need studio profiles for IDs:', profileIds);
      } else if (userRole === 'studio') {
        profileIds = [...new Set(data.map(item => item.artist_id))].filter(Boolean);
        console.log('Need artist profiles for IDs:', profileIds);
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

      // Transform the data
      const transformedData: SharedTask[] = data.map((item, index) => {
        console.log(`Processing shared task ${index + 1}:`, item);
        
        let profileToShow;
        if (userRole === 'artist') {
          profileToShow = profiles.find(p => p.id === item.studio_id);
          console.log('Found studio profile:', profileToShow);
        } else if (userRole === 'studio') {
          profileToShow = profiles.find(p => p.id === item.artist_id);
          console.log('Found artist profile:', profileToShow);
        }
        
        const transformed = {
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
        
        console.log('Transformed shared task:', transformed);
        return transformed;
      });
      
      console.log('Final transformed data:', transformedData);
      console.log('Setting sharedTasks with', transformedData.length, 'items');
      setSharedTasks(transformedData);
      
    } catch (error) {
      console.error('Error in fetchSharedTasks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch shared tasks",
        variant: "destructive",
      });
      setSharedTasks([]);
    } finally {
      console.log('Setting loading to false');
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
