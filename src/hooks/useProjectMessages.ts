
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
        console.log('Fetching messages for project:', projectId);
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

        if (error) {
          console.error('Error fetching messages:', error);
          throw error;
        }

        console.log('Fetched messages:', data);
        const typedMessages: ProjectMessage[] = (data || []).map(msg => ({
          ...msg,
          message_type: msg.message_type as 'text' | 'system' | 'file_upload' | 'status_update'
        }));

        setMessages(typedMessages);
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
          console.log('New message received:', payload);
          
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
            const typedMessage: ProjectMessage = {
              ...data,
              message_type: data.message_type as 'text' | 'system' | 'file_upload' | 'status_update'
            };
            setMessages(prev => [...prev, typedMessage]);
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
      console.log('Attempting to send message:', { content, messageType, projectId });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user found');
        throw new Error('Not authenticated');
      }

      console.log('Authenticated user:', user.id);

      // Check if user has access to this project
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('id, client_id, assigned_to')
        .eq('id', projectId)
        .single();

      if (projectError) {
        console.error('Error checking project access:', projectError);
        throw new Error('Cannot access project');
      }

      console.log('Project data:', projectData);
      console.log('User has access:', projectData.client_id === user.id || projectData.assigned_to === user.id);

      const messageData = {
        project_id: projectId,
        sender_id: user.id,
        content,
        message_type: messageType,
        metadata,
      };

      console.log('Inserting message:', messageData);

      const { data, error } = await supabase
        .from('project_messages')
        .insert(messageData)
        .select()
        .single();

      if (error) {
        console.error('Error inserting message:', error);
        throw error;
      }

      console.log('Message inserted successfully:', data);

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: `Failed to send message: ${error.message}`,
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
