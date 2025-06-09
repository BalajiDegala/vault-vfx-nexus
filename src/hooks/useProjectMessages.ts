
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProjectMessage {
  id: string;
  project_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'system' | 'file_upload' | 'status_update';
  metadata: any;
  created_at: string;
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

  useEffect(() => {
    if (!projectId) return;

    // Fetch initial messages
    const fetchMessages = async () => {
      try {
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
          .order('created_at', { ascending: true })
          .limit(50);

        if (error) throw error;

        setMessages(data || []);
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`project-messages-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'project_messages',
          filter: `project_id=eq.${projectId}`,
        },
        async (payload) => {
          console.log('New message:', payload);
          
          // Fetch the complete message with profile data
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
            .eq('id', payload.new.id)
            .single();

          if (!error && data) {
            setMessages(prev => [...prev, data]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, toast]);

  const sendMessage = async (content: string, messageType: 'text' | 'system' | 'file_upload' | 'status_update' = 'text', metadata: any = {}) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('project_messages')
        .insert({
          project_id: projectId,
          sender_id: user.id,
          content,
          message_type: messageType,
          metadata,
        });

      if (error) throw error;

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  return {
    messages,
    loading,
    sendMessage,
  };
};
