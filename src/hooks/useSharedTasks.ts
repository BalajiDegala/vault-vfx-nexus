
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
      console.log('❌ useSharedTasks: No userId provided');
      setLoading(false);
      return;
    }
    console.log('🔄 useSharedTasks: Starting fetch with userId:', userId, 'userRole:', userRole);
    fetchSharedTasks();
  }, [userId, userRole]);

  const fetchSharedTasks = async () => {
    try {
      console.log('=== 🔍 FETCHING SHARED TASKS ===');
      console.log('📍 User ID:', userId);
      console.log('👤 User Role:', userRole);
      
      // Build the main query
      console.log('🔍 Building main query...');
      
      let query = supabase.from('shared_tasks').select(`
        *,
        tasks (
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
        console.log('🎨 Adding artist filter for userId:', userId);
        query = query.eq('artist_id', userId);
      } else if (userRole === 'studio') {
        console.log('🏢 Adding studio filter for userId:', userId);
        query = query.eq('studio_id', userId);
      }

      console.log('⚡ Executing main query...');
      const { data, error } = await query;

      console.log('✅ Query completed');
      console.log('❌ Query error:', error);
      console.log('📦 Raw query data:', data);
      console.log('📊 Data length:', data?.length || 0);

      if (error) {
        console.error('💥 Supabase query error details:', error);
        toast({
          title: "Error",
          description: "Failed to fetch shared tasks",
          variant: "destructive",
        });
        setSharedTasks([]);
        return;
      }

      if (!data || data.length === 0) {
        console.log('⚠️ No shared tasks found for this user');
        setSharedTasks([]);
        return;
      }

      console.log('🔧 Processing shared tasks data...');

      // Get profile IDs based on user role
      let profileIds: string[] = [];
      if (userRole === 'artist') {
        profileIds = [...new Set(data.map(item => item.studio_id))].filter(Boolean);
        console.log('🏢 Need studio profiles for IDs:', profileIds);
      } else if (userRole === 'studio') {
        profileIds = [...new Set(data.map(item => item.artist_id))].filter(Boolean);
        console.log('🎨 Need artist profiles for IDs:', profileIds);
      }
      
      let profiles: any[] = [];
      if (profileIds.length > 0) {
        console.log('👥 Fetching profiles for IDs:', profileIds);
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', profileIds);
        
        profiles = profilesData || [];
        console.log('✅ Fetched profiles:', profiles);
        if (profilesError) {
          console.error('❌ Profiles fetch error:', profilesError);
        }
      }

      // Transform the data
      console.log('🔄 Transforming data...');
      const transformedData: SharedTask[] = data.map((item, index) => {
        console.log(`🔧 Processing shared task ${index + 1}:`, item);
        
        let profileToShow;
        if (userRole === 'artist') {
          profileToShow = profiles.find(p => p.id === item.studio_id);
          console.log('🏢 Found studio profile:', profileToShow);
        } else if (userRole === 'studio') {
          profileToShow = profiles.find(p => p.id === item.artist_id);
          console.log('🎨 Found artist profile:', profileToShow);
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
        
        console.log('✨ Transformed shared task:', transformed);
        return transformed;
      });
      
      console.log('🎉 Final transformed data:', transformedData);
      console.log('📊 Setting sharedTasks with', transformedData.length, 'items');
      setSharedTasks(transformedData);
      
    } catch (error) {
      console.error('💥 Unexpected error in fetchSharedTasks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch shared tasks",
        variant: "destructive",
      });
      setSharedTasks([]);
    } finally {
      console.log('🏁 Setting loading to false');
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
