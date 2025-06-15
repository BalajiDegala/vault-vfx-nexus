
import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

  const stableOnNewMessageReceived = useCallback(onNewMessageReceived, [onNewMessageReceived]);
  const stableOnRecipientTypingStatusChange = useCallback(onRecipientTypingStatusChange, [onRecipientTypingStatusChange]);

  useEffect(() => {
    // Clean up existing channels if user IDs changed
    if (currentUserIdRef.current !== currentUserId || recipientIdRef.current !== recipientId) {
      if (messagesChannelRef.current) {
        supabase.removeChannel(messagesChannelRef.current);
        messagesChannelRef.current = null;
      }
      if (typingChannelRef.current) {
        supabase.removeChannel(typingChannelRef.current);
        typingChannelRef.current = null;
      }
      currentUserIdRef.current = currentUserId;
      recipientIdRef.current = recipientId;
    }

    if (!currentUserId || !recipientId) {
      return;
    }

    // Subscribe to new messages only if we don't have an active channel
    if (!messagesChannelRef.current) {
      const messageChannelName = generateChannelName('dm-room', currentUserId, recipientId);
      const messagesChannel = supabase.channel(messageChannelName);
      
      messagesChannel
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'direct_messages',
            filter: `or(and(sender_id.eq.${currentUserId},receiver_id.eq.${recipientId}),and(sender_id.eq.${recipientId},receiver_id.eq.${currentUserId}))`
          },
          () => {
            console.log('New message received via subscription, fetching messages.');
            stableOnNewMessageReceived();
          }
        )
        .subscribe((status: string) => {
          console.log(`Messages channel [${messageChannelName}] subscription status:`, status);
        });

      messagesChannelRef.current = messagesChannel;
    }

    // Subscribe to typing indicators only if we don't have an active channel
    if (!typingChannelRef.current) {
      const typingChannelName = generateChannelName('typing-room', currentUserId, recipientId);
      const typingChannel = supabase.channel(typingChannelName);
      
      typingChannel
        .on('broadcast', { event: 'typing' }, ({ payload }: { payload: any }) => {
          if (payload.user_id === recipientId) {
            stableOnRecipientTypingStatusChange(payload.typing);
          }
        })
        .subscribe((status: string) => {
          console.log(`Typing channel [${typingChannelName}] subscription status:`, status);
        });

      typingChannelRef.current = typingChannel;
    }
    
    return () => {
      if (messagesChannelRef.current) {
        console.log('Cleaning up messages channel:', messagesChannelRef.current.topic);
        supabase.removeChannel(messagesChannelRef.current);
        messagesChannelRef.current = null;
      }
      if (typingChannelRef.current) {
        console.log('Cleaning up typing channel:', typingChannelRef.current.topic);
        supabase.removeChannel(typingChannelRef.current);
        typingChannelRef.current = null;
      }
    };
  }, [currentUserId, recipientId, stableOnNewMessageReceived, stableOnRecipientTypingStatusChange]);

  const broadcastTyping = useCallback((isTyping: boolean) => {
    if (typingChannelRef.current) {
      typingChannelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { user_id: currentUserId, typing: isTyping }
      });
    } else {
      console.warn('Typing channel not ready for broadcast.');
    }
  }, [currentUserId]);

  return { broadcastTyping };
};
