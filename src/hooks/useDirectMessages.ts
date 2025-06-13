
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DirectMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  sender_profile?: {
    first_name: string;
    last_name: string;
    avatar_url: string;
  };
}

export const useDirectMessages = (currentUserId: string, recipientId: string) => {
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const { toast } = useToast();
  const messagesChannelRef = useRef<any>(null);
  const typingChannelRef = useRef<any>(null);
  const isMessagesSubscribedRef = useRef(false);
  const isTypingSubscribedRef = useRef(false);

  const fetchMessages = async () => {
    if (!currentUserId || !recipientId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('direct_messages')
        .select(`
          *,
          sender_profile:profiles!sender_id (
            first_name,
            last_name,
            avatar_url
          )
        `)
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${recipientId}),and(sender_id.eq.${recipientId},receiver_id.eq.${currentUserId})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      const transformedMessages = (data || []).map(msg => ({
        ...msg,
        sender_profile: Array.isArray(msg.sender_profile) 
          ? msg.sender_profile[0] 
          : msg.sender_profile
      }));
      
      setMessages(transformedMessages);
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

  const sendMessage = async (content: string) => {
    if (!content.trim() || !currentUserId || !recipientId) return false;

    try {
      const { error } = await supabase
        .from('direct_messages')
        .insert({
          sender_id: currentUserId,
          receiver_id: recipientId,
          content: content.trim()
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
      return false;
    }
  };

  const subscribeToMessages = () => {
    // Clean up existing channel
    if (messagesChannelRef.current) {
      console.log('Cleaning up messages channel');
      supabase.removeChannel(messagesChannelRef.current);
      messagesChannelRef.current = null;
      isMessagesSubscribedRef.current = false;
    }

    const channelName = `direct_messages_${currentUserId}_${recipientId}_${Date.now()}`;
    const channel = supabase.channel(channelName);

    // Store reference immediately
    messagesChannelRef.current = channel;

    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'direct_messages',
        filter: `or(and(sender_id.eq.${currentUserId},receiver_id.eq.${recipientId}),and(sender_id.eq.${recipientId},receiver_id.eq.${currentUserId}))`
      },
      () => {
        fetchMessages();
      }
    );

    // Subscribe only if not already subscribed
    if (!isMessagesSubscribedRef.current) {
      channel.subscribe((status) => {
        console.log('Messages channel subscription status:', status);
        if (status === 'SUBSCRIBED') {
          isMessagesSubscribedRef.current = true;
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          isMessagesSubscribedRef.current = false;
        }
      });
    }

    return () => {
      if (messagesChannelRef.current) {
        supabase.removeChannel(messagesChannelRef.current);
        messagesChannelRef.current = null;
        isMessagesSubscribedRef.current = false;
      }
    };
  };

  const broadcastTyping = (isTyping: boolean) => {
    if (typingChannelRef.current && isTypingSubscribedRef.current) {
      typingChannelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { user_id: currentUserId, typing: isTyping }
      });
    }
  };

  const subscribeToTyping = (onTypingChange: (isTyping: boolean) => void) => {
    // Clean up existing typing channel
    if (typingChannelRef.current) {
      console.log('Cleaning up typing channel');
      supabase.removeChannel(typingChannelRef.current);
      typingChannelRef.current = null;
      isTypingSubscribedRef.current = false;
    }

    const channelName = `typing_${recipientId}_${currentUserId}_${Date.now()}`;
    const channel = supabase.channel(channelName);

    // Store reference immediately
    typingChannelRef.current = channel;

    channel.on('broadcast', { event: 'typing' }, ({ payload }) => {
      if (payload.user_id === recipientId) {
        onTypingChange(payload.typing);
      }
    });

    // Subscribe only if not already subscribed
    if (!isTypingSubscribedRef.current) {
      channel.subscribe((status) => {
        console.log('Typing channel subscription status:', status);
        if (status === 'SUBSCRIBED') {
          isTypingSubscribedRef.current = true;
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          isTypingSubscribedRef.current = false;
        }
      });
    }

    return () => {
      if (typingChannelRef.current) {
        supabase.removeChannel(typingChannelRef.current);
        typingChannelRef.current = null;
        isTypingSubscribedRef.current = false;
      }
    };
  };

  useEffect(() => {
    if (currentUserId && recipientId) {
      fetchMessages();
      const unsubscribe = subscribeToMessages();
      return unsubscribe;
    }
  }, [currentUserId, recipientId]);

  return {
    messages,
    loading,
    typing,
    setTyping,
    sendMessage,
    broadcastTyping,
    subscribeToTyping,
    refreshMessages: fetchMessages
  };
};
