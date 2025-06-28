
import logger from "@/lib/logger";
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface DirectMessage {
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

export const useSimpleDirectMessages = (
  currentUserId: string, 
  recipientId: string,
  onRecipientTyping: (isTyping: boolean) => void
) => {
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const { toast } = useToast();
  
  const channelRef = useRef<RealtimeChannel | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout>();
  const lastMessageIdRef = useRef<string>('');

  // Generate consistent channel name for both users
  const getChannelName = useCallback(() => {
    const sortedIds = [currentUserId, recipientId].sort();
    return `dm-${sortedIds[0]}-${sortedIds[1]}`;
  }, [currentUserId, recipientId]);

  const fetchMessages = useCallback(async () => {
    if (!currentUserId || !recipientId) return;
    
    logger.log(`📥 Fetching messages between ${currentUserId} and ${recipientId}`);
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
      
      logger.log(`📥 Loaded ${transformedMessages.length} messages`);
      setMessages(transformedMessages);
      
      // Update last message ID for polling
      if (transformedMessages.length > 0) {
        lastMessageIdRef.current = transformedMessages[transformedMessages.length - 1].id;
      }
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
  }, [currentUserId, recipientId, toast]);

  // Polling fallback for when real-time fails
  const startPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    
    pollIntervalRef.current = setInterval(async () => {
      if (!currentUserId || !recipientId) return;
      
      try {
        const { data, error } = await supabase
          .from('direct_messages')
          .select('id, created_at')
          .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${recipientId}),and(sender_id.eq.${recipientId},receiver_id.eq.${currentUserId})`)
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) throw error;
        
        if (data && data.length > 0 && data[0].id !== lastMessageIdRef.current) {
          logger.log('📊 Polling detected new message, refreshing...');
          fetchMessages();
        }
      } catch (error) {
        logger.error('Polling error:', error);
      }
    }, 3000); // Poll every 3 seconds
  }, [currentUserId, recipientId, fetchMessages]);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = undefined;
    }
  }, []);

  // Setup real-time subscription with fallback
  const setupRealtime = useCallback(() => {
    if (!currentUserId || !recipientId) return;

    const channelName = getChannelName();
    logger.log(`🔄 Setting up real-time channel: ${channelName}`);
    
    const channel = supabase.channel(channelName, {
      config: { broadcast: { self: false } }
    });

    // Listen for new messages
    channel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages'
        },
        (payload) => {
          logger.log('📨 Real-time message received:', payload);
          const newMessage = payload.new as DirectMessage;
          
          // Check if this message is for our conversation
          const isForThisConversation = 
            (newMessage.sender_id === currentUserId && newMessage.receiver_id === recipientId) ||
            (newMessage.sender_id === recipientId && newMessage.receiver_id === currentUserId);
          
          if (isForThisConversation) {
            logger.log('✅ Message is for this conversation, refreshing...');
            fetchMessages();
          }
        }
      )
      // Listen for typing indicators
      .on('broadcast', { event: 'typing' }, ({ payload }: { payload: { user_id: string; typing: boolean } }) => {
        logger.log('⌨️ Typing indicator received:', payload);
        if (payload.user_id === recipientId) {
          onRecipientTyping(payload.typing);
        }
      })
      .subscribe((status: string, err?: Error) => {
        logger.log(`Real-time channel [${channelName}] status:`, status);
        
        if (status === 'SUBSCRIBED') {
          logger.log('✅ Real-time connected successfully');
          setIsRealtimeConnected(true);
          stopPolling(); // Stop polling when real-time works
        } else if (status === 'CHANNEL_ERROR' || status === 'CLOSED') {
          logger.warn('❌ Real-time failed, falling back to polling:', err);
          setIsRealtimeConnected(false);
          startPolling(); // Start polling as fallback
        }
      });

    channelRef.current = channel;
  }, [currentUserId, recipientId, getChannelName, fetchMessages, onRecipientTyping, startPolling, stopPolling]);

  // Broadcast typing status
  const broadcastTyping = useCallback((isTyping: boolean) => {
    if (channelRef.current?.state === 'joined') {
      logger.log(`⌨️ Broadcasting typing status: ${isTyping}`);
      channelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { user_id: currentUserId, typing: isTyping }
      });
    } else {
      logger.warn('⚠️ Cannot broadcast typing, channel not ready');
    }
  }, [currentUserId]);

  // Send message with optimistic update
  const sendMessage = async (content: string) => {
    if (!content.trim() || !currentUserId || !recipientId) return false;

    logger.log(`📤 Sending message from ${currentUserId} to ${recipientId}`);
    
    // Optimistic update - add message immediately
    const optimisticMessage: DirectMessage = {
      id: `temp-${Date.now()}`,
      sender_id: currentUserId,
      receiver_id: recipientId,
      content: content.trim(),
      created_at: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      const { error } = await supabase
        .from('direct_messages')
        .insert({
          sender_id: currentUserId,
          receiver_id: recipientId,
          content: content.trim()
        });

      if (error) throw error;
      
      logger.log('✅ Message sent successfully');
      
      // Remove optimistic message and refresh to get real message
      setTimeout(() => {
        fetchMessages();
      }, 500);
      
      return true;
    } catch (error) {
      logger.error('Error sending message:', error);
      
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
      
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
      return false;
    }
  };

  // Setup effect
  useEffect(() => {
    if (!currentUserId || !recipientId) {
      setMessages([]);
      return;
    }
    
    logger.log('🔄 Setting up direct messages for:', currentUserId, recipientId);
    
    // Initial fetch
    fetchMessages();
    
    // Setup real-time with fallback
    setupRealtime();
    
    return () => {
      logger.log('🧹 Cleaning up direct messages...');
      
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      
      stopPolling();
      setIsRealtimeConnected(false);
    };
  }, [currentUserId, recipientId, fetchMessages, setupRealtime, stopPolling]);

  return {
    messages,
    loading,
    isRealtimeConnected,
    sendMessage,
    broadcastTyping,
    refreshMessages: fetchMessages
  };
};
