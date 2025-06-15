
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

interface ProjectPresence {
  user_id: string;
  username: string;
  avatar_url?: string;
  current_section: string;
  last_seen: string;
}

interface ProjectUpdate {
  id: string;
  type: 'status_change' | 'milestone_update' | 'assignment_change' | 'comment_added';
  message: string;
  user_id: string;
  username: string;
  timestamp: string;
  metadata?: any;
}

export const useProjectRealtime = (projectId: string, userId: string, username: string) => {
  const [presence, setPresence] = useState<Record<string, ProjectPresence>>({});
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!projectId || !userId) return;

    const projectChannel = supabase.channel(`project_${projectId}`, {
      config: {
        presence: {
          key: userId,
        },
      },
    });

    // Track user presence
    const userPresence: ProjectPresence = {
      user_id: userId,
      username: username || 'Anonymous',
      current_section: 'overview',
      last_seen: new Date().toISOString(),
    };

    projectChannel
      .on('presence', { event: 'sync' }, () => {
        const newState = projectChannel.presenceState();
        const presenceMap: Record<string, ProjectPresence> = {};
        
        Object.entries(newState).forEach(([key, presences]) => {
          if (presences && presences.length > 0) {
            // Properly type the presence data
            const presenceData = presences[0] as unknown as ProjectPresence;
            presenceMap[key] = presenceData;
          }
        });
        
        setPresence(presenceMap);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .on('broadcast', { event: 'project_update' }, (payload) => {
        const update = payload.payload as ProjectUpdate;
        setUpdates(prev => [update, ...prev].slice(0, 50)); // Keep last 50 updates
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          await projectChannel.track(userPresence);
        } else {
          setIsConnected(false);
        }
      });

    setChannel(projectChannel);

    return () => {
      projectChannel.unsubscribe();
    };
  }, [projectId, userId, username]);

  const updatePresence = async (section: string) => {
    if (!channel) return;
    
    const userPresence: ProjectPresence = {
      user_id: userId,
      username: username || 'Anonymous',
      current_section: section,
      last_seen: new Date().toISOString(),
    };
    
    await channel.track(userPresence);
  };

  const broadcastUpdate = async (update: Omit<ProjectUpdate, 'id' | 'timestamp'>) => {
    if (!channel) return;
    
    const fullUpdate: ProjectUpdate = {
      ...update,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
    
    await channel.send({
      type: 'broadcast',
      event: 'project_update',
      payload: fullUpdate,
    });
  };

  const getActiveUsers = () => {
    return Object.values(presence).filter(p => p.user_id !== userId);
  };

  const getUsersInSection = (section: string) => {
    return Object.values(presence).filter(p => 
      p.current_section === section && p.user_id !== userId
    );
  };

  return {
    presence,
    updates,
    isConnected,
    updatePresence,
    broadcastUpdate,
    getActiveUsers,
    getUsersInSection,
  };
};
