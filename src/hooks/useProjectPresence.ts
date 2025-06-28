import logger from "@/lib/logger";
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';
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
  const channelRef = useRef<RealtimeChannel | null>(null);
  const isSubscribedRef = useRef(false);

  useEffect(() => {
    if (!projectId || !userId) return;

    // Cleanup existing channel first
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      isSubscribedRef.current = false;
    }

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

    const initializePresence = async () => {
      await updatePresence();
      await fetchPresence();

      // Create new channel with unique identifier
      const channelName = `project-presence-${projectId}-${Date.now()}`;
      channelRef.current = supabase.channel(channelName);
      
      // Only subscribe if not already subscribed
      if (!isSubscribedRef.current) {
        channelRef.current
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'project_presence',
              filter: `project_id=eq.${projectId}`,
            },
            (payload) => {
              logger.log('Presence change:', payload);
              fetchPresence(); // Refetch to get updated data
            }
          )
          .subscribe((status) => {
            logger.log('Presence subscription status:', status);
            if (status === 'SUBSCRIBED') {
              isSubscribedRef.current = true;
            }
          });
      }
    };

    initializePresence();

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
      
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        isSubscribedRef.current = false;
      }
    };
  }, [projectId, userId]);

  const updatePresence = async (section: string) => {
    try {
      await supabase
        .from('project_presence')
        .update({ 
          current_section: section,
          status: 'online'
        })
        .eq('project_id', projectId)
        .eq('user_id', userId);
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  };

  return {
    presenceUsers: presenceUsers.filter(user => user.user_id !== userId), // Don't show current user
    loading,
    updatePresence,
    updateSection: updatePresence, // Keep both for backward compatibility
  };
};
