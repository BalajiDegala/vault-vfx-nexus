
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserPresence {
  id: string;
  user_id: string;
  project_id: string;
  status: 'online' | 'away' | 'offline';
  last_seen: string;
  current_section: string;
  profile?: {
    first_name: string;
    last_name: string;
    avatar_url: string;
  };
}

export const useProjectPresence = (projectId: string, userId: string) => {
  const [presenceUsers, setPresenceUsers] = useState<UserPresence[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!projectId || !userId) return;

    // Update user's presence when they join
    const updatePresence = async () => {
      try {
        await supabase
          .from('project_presence')
          .upsert({
            project_id: projectId,
            user_id: userId,
            status: 'online',
            current_section: 'overview',
          });
      } catch (error) {
        console.error('Error updating presence:', error);
      }
    };

    // Fetch initial presence data
    const fetchPresence = async () => {
      try {
        const { data, error } = await supabase
          .from('project_presence')
          .select(`
            *,
            profiles:user_id (
              first_name,
              last_name,
              avatar_url
            )
          `)
          .eq('project_id', projectId)
          .eq('status', 'online');

        if (error) throw error;

        // Type cast the data to ensure proper typing
        const typedPresence: UserPresence[] = (data || []).map(presence => ({
          ...presence,
          status: presence.status as 'online' | 'away' | 'offline'
        }));

        setPresenceUsers(typedPresence);
      } catch (error) {
        console.error('Error fetching presence:', error);
      } finally {
        setLoading(false);
      }
    };

    updatePresence();
    fetchPresence();

    // Subscribe to presence changes
    const channel = supabase
      .channel(`project-presence-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_presence',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          console.log('Presence change:', payload);
          fetchPresence(); // Refetch to get updated data
        }
      )
      .subscribe();

    // Update presence on page visibility change
    const handleVisibilityChange = () => {
      const status = document.hidden ? 'away' : 'online';
      supabase
        .from('project_presence')
        .update({ status })
        .eq('project_id', projectId)
        .eq('user_id', userId);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup function
    return () => {
      // Set user as offline when leaving
      supabase
        .from('project_presence')
        .update({ status: 'offline' })
        .eq('project_id', projectId)
        .eq('user_id', userId);

      document.removeEventListener('visibilitychange', handleVisibilityChange);
      supabase.removeChannel(channel);
    };
  }, [projectId, userId]);

  const updateSection = async (section: string) => {
    try {
      await supabase
        .from('project_presence')
        .update({ current_section: section })
        .eq('project_id', projectId)
        .eq('user_id', userId);
    } catch (error) {
      console.error('Error updating section:', error);
    }
  };

  return {
    presenceUsers: presenceUsers.filter(user => user.user_id !== userId), // Don't show current user
    loading,
    updateSection,
  };
};
