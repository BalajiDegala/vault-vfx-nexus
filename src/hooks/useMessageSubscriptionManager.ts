
import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const generateChannelName = (prefix: string, userId1: string, userId2: string): string => {
  const sortedIds = [userId1, userId2].sort();
  return `${prefix}-${sortedIds[0]}-${sortedIds[1]}`;
};

export const useMessageSubscriptionManager = (
  currentUserId: string,
  recipientId: string,
  onNewMessageReceived: () => void,
  onRecipientTypingStatusChange: (isTyping: boolean) => void
) => {
  const messagesChannelRef = useRef<any>(null);
  const typingChannelRef = useRef<any>(null);
  const currentUserIdRef = useRef(currentUserId);
  const recipientIdRef = useRef(recipientId);
  const retryTimeoutRef = useRef<NodeJS.Timeout>();
  const maxRetries = 3;
  const retryDelayMs = 2000;
  const { toast } = useToast();

  const stableOnNewMessageReceived = useCallback(onNewMessageReceived, [onNewMessageReceived]);
  const stableOnRecipientTypingStatusChange = useCallback(onRecipientTypingStatusChange, [onRecipientTypingStatusChange]);

  const setupMessagesChannel = useCallback((retryCount = 0) => {
    if (!currentUserId || !recipientId) return;

    const messageChannelName = generateChannelName('dm-messages', currentUserId, recipientId);
    console.log(`Setting up messages channel: ${messageChannelName} (attempt ${retryCount + 1})`);
    
    const messagesChannel = supabase.channel(messageChannelName, {
      config: {
        broadcast: { self: false },
        presence: { key: currentUserId }
      }
    });
    
    messagesChannel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `or(and(sender_id.eq.${currentUserId},receiver_id.eq.${recipientId}),and(sender_id.eq.${recipientId},receiver_id.eq.${currentUserId}))`
        },
        (payload) => {
          console.log('📨 New message received via real-time:', payload);
          stableOnNewMessageReceived();
        }
      )
      .subscribe((status: string, err?: Error) => {
        console.log(`Messages channel [${messageChannelName}] status:`, status);
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Messages real-time subscription active');
        } else if (status === 'CHANNEL_ERROR' && retryCount < maxRetries) {
          console.warn(`❌ Messages channel error, retrying in ${retryDelayMs}ms...`, err);
          
          // Clean up failed channel
          if (messagesChannelRef.current) {
            supabase.removeChannel(messagesChannelRef.current);
            messagesChannelRef.current = null;
          }
          
          // Retry after delay
          retryTimeoutRef.current = setTimeout(() => {
            setupMessagesChannel(retryCount + 1);
          }, retryDelayMs);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Messages channel failed after max retries:', err);
          toast({
            title: "Real-time messaging unavailable",
            description: "Messages may not appear instantly. Please refresh the page.",
            variant: "destructive",
          });
        }
      });

    messagesChannelRef.current = messagesChannel;
  }, [currentUserId, recipientId, stableOnNewMessageReceived, toast]);

  const setupTypingChannel = useCallback((retryCount = 0) => {
    if (!currentUserId || !recipientId) return;

    const typingChannelName = generateChannelName('dm-typing', currentUserId, recipientId);
    console.log(`Setting up typing channel: ${typingChannelName} (attempt ${retryCount + 1})`);
    
    const typingChannel = supabase.channel(typingChannelName, {
      config: {
        broadcast: { self: false },
        presence: { key: currentUserId }
      }
    });
    
    typingChannel
      .on('broadcast', { event: 'typing' }, ({ payload }: { payload: any }) => {
        console.log('⌨️ Typing indicator received:', payload);
        if (payload.user_id === recipientId) {
          stableOnRecipientTypingStatusChange(payload.typing);
        }
      })
      .subscribe((status: string, err?: Error) => {
        console.log(`Typing channel [${typingChannelName}] status:`, status);
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Typing indicators real-time subscription active');
        } else if (status === 'CHANNEL_ERROR' && retryCount < maxRetries) {
          console.warn(`❌ Typing channel error, retrying in ${retryDelayMs}ms...`, err);
          
          // Clean up failed channel
          if (typingChannelRef.current) {
            supabase.removeChannel(typingChannelRef.current);
            typingChannelRef.current = null;
          }
          
          // Retry after delay
          retryTimeoutRef.current = setTimeout(() => {
            setupTypingChannel(retryCount + 1);
          }, retryDelayMs);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Typing channel failed after max retries:', err);
        }
      });

    typingChannelRef.current = typingChannel;
  }, [currentUserId, recipientId, stableOnRecipientTypingStatusChange]);

  useEffect(() => {
    // Clean up existing channels if user IDs changed
    if (currentUserIdRef.current !== currentUserId || recipientIdRef.current !== recipientId) {
      console.log('👥 User IDs changed, cleaning up channels...');
      
      if (messagesChannelRef.current) {
        supabase.removeChannel(messagesChannelRef.current);
        messagesChannelRef.current = null;
      }
      if (typingChannelRef.current) {
        supabase.removeChannel(typingChannelRef.current);
        typingChannelRef.current = null;
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      
      currentUserIdRef.current = currentUserId;
      recipientIdRef.current = recipientId;
    }

    if (!currentUserId || !recipientId) {
      console.log('❌ Missing user IDs, skipping channel setup');
      return;
    }

    // Set up channels if they don't exist
    if (!messagesChannelRef.current) {
      setupMessagesChannel();
    }
    if (!typingChannelRef.current) {
      setupTypingChannel();
    }
    
    return () => {
      console.log('🧹 Cleaning up message subscription channels...');
      
      if (messagesChannelRef.current) {
        console.log('Removing messages channel:', messagesChannelRef.current.topic);
        supabase.removeChannel(messagesChannelRef.current);
        messagesChannelRef.current = null;
      }
      if (typingChannelRef.current) {
        console.log('Removing typing channel:', typingChannelRef.current.topic);
        supabase.removeChannel(typingChannelRef.current);
        typingChannelRef.current = null;
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [currentUserId, recipientId, setupMessagesChannel, setupTypingChannel]);

  const broadcastTyping = useCallback((isTyping: boolean) => {
    if (typingChannelRef.current?.state === 'joined') {
      console.log(`⌨️ Broadcasting typing status: ${isTyping}`);
      typingChannelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { user_id: currentUserId, typing: isTyping }
      });
    } else {
      console.warn('⚠️ Typing channel not ready for broadcast, state:', typingChannelRef.current?.state);
    }
  }, [currentUserId]);

  return { broadcastTyping };
};
