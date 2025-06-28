
import logger from "@/lib/logger";
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface ProjectMessage {
  id: string;
  project_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'system' | 'file_upload' | 'status_update';
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
    avatar_url: string;
  };
}

export const useProjectMessages = (projectId: string) => {
  const [messages, setMessages] = useState<ProjectMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    const fetchMessages = async () => {
      try {
        setLoading(true);
        logger.log('Fetching messages for project:', projectId);
        const { data, error } = await supabase
          .from('project_messages')
          .select(`
            *,
            profiles:sender_id (
              first_name,
              last_name,
              avatar_url
            )
          `)
          .eq('project_id', projectId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        
        const typedMessages: ProjectMessage[] = (data || []).map(msg => ({
          ...msg,
          message_type: msg.message_type as 'text' | 'system' | 'file_upload' | 'status_update'
        }));
        setMessages(typedMessages);
      } catch (error) {
        logger.error('Error fetching messages:', error);
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    const initializeRealtime = () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }

      const channelName = `project-messages-${projectId}`;
      channelRef.current = supabase.channel(channelName, {
        config: { broadcast: { self: true } }
      });

      channelRef.current
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'project_messages',
            filter: `project_id=eq.${projectId}`,
          },
          async (payload) => {
            logger.log('Realtime event received:', payload);
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              const { data, error } = await supabase
                .from('project_messages')
                .select(`*, profiles:sender_id (first_name, last_name, avatar_url)`)
                .eq('id', payload.new.id)
                .single();

              if (!error && data) {
                const newMessage = data as ProjectMessage;
                setMessages(prev => {
                  const exists = prev.some(m => m.id === newMessage.id);
                  if (exists) {
                    return prev.map(m => m.id === newMessage.id ? newMessage : m);
                  }
                  return [...prev, newMessage];
                });
              }
            } else if (payload.eventType === 'DELETE') {
              setMessages(prev => prev.filter(m => m.id !== payload.old.id));
            }
          }
        )
        .subscribe((status) => {
          logger.log(`Subscription to ${channelName}: ${status}`);
        });
    };

    fetchMessages();
    initializeRealtime();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [projectId, toast]);

  const sendMessage = async (
    content: string,
    messageType: 'text' | 'system' | 'file_upload' | 'status_update' = 'text',
    metadata: Record<string, unknown> = {}
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const messageData = {
        project_id: projectId,
        sender_id: user.id,
        content,
        message_type: messageType,
        metadata,
      };
      const { error } = await supabase.from('project_messages').insert(messageData);
      if (error) throw error;
    } catch (error) {
      logger.error('Error sending message:', error);
      toast({
        title: "Error",
        description: `Failed to send message: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const updateMessage = async (messageId: string, content: string) => {
    try {
      const { error } = await supabase
        .from('project_messages')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', messageId);
      if (error) throw error;
    } catch (error) {
      logger.error('Error updating message:', error);
      toast({
        title: 'Error',
        description: `Failed to update message: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase.from('project_messages').delete().eq('id', messageId);
      if (error) throw error;
    } catch (error) {
      logger.error('Error deleting message:', error);
      toast({
        title: 'Error',
        description: `Failed to delete message: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  return {
    messages,
    loading,
    sendMessage,
    updateMessage,
    deleteMessage,
  };
};

