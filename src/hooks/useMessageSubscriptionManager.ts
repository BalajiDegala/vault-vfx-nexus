
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
  const isMessagesSubscribedRef = useRef(false);
  const isTypingSubscribedRef = useRef(false);

  const stableOnNewMessageReceived = useCallback(onNewMessageReceived, [onNewMessageReceived]);
  const stableOnRecipientTypingStatusChange = useCallback(onRecipientTypingStatusChange, [onRecipientTypingStatusChange]);

  useEffect(() => {
    if (!currentUserId || !recipientId) {
      return;
    }

    // Subscribe to new messages
    const messageChannelName = generateChannelName('dm-room', currentUserId, recipientId);
    if (!messagesChannelRef.current || messagesChannelRef.current.topic !== `realtime:${messageChannelName}`) {
      if (messagesChannelRef.current) {
        supabase.removeChannel(messagesChannelRef.current);
        isMessagesSubscribedRef.current = false;
      }
      messagesChannelRef.current = supabase.channel(messageChannelName);
    }
    
    if (!isMessagesSubscribedRef.current) {
      messagesChannelRef.current.on(
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
      ).subscribe((status: string) => {
        console.log(`Messages channel [${messageChannelName}] subscription status:`, status);
        if (status === 'SUBSCRIBED') {
          isMessagesSubscribedRef.current = true;
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          isMessagesSubscribedRef.current = false;
        }
      });
    }

    // Subscribe to typing indicators
    const typingChannelNameKey = generateChannelName('typing-room', currentUserId, recipientId);
    if (!typingChannelRef.current || typingChannelRef.current.topic !== `realtime:${typingChannelNameKey}`) {
      if (typingChannelRef.current) {
        supabase.removeChannel(typingChannelRef.current);
        isTypingSubscribedRef.current = false;
      }
      typingChannelRef.current = supabase.channel(typingChannelNameKey);
    }

    if (!isTypingSubscribedRef.current) {
      typingChannelRef.current.on('broadcast', { event: 'typing' }, ({ payload }: { payload: any }) => {
        if (payload.user_id === recipientId) {
          stableOnRecipientTypingStatusChange(payload.typing);
        }
      }).subscribe((status: string) => {
        console.log(`Typing channel [${typingChannelNameKey}] subscription status:`, status);
        if (status === 'SUBSCRIBED') {
          isTypingSubscribedRef.current = true;
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          isTypingSubscribedRef.current = false;
        }
      });
    }
    
    return () => {
      if (messagesChannelRef.current) {
        console.log('Cleaning up messages channel:', messagesChannelRef.current.topic);
        supabase.removeChannel(messagesChannelRef.current);
        messagesChannelRef.current = null;
        isMessagesSubscribedRef.current = false;
      }
      if (typingChannelRef.current) {
        console.log('Cleaning up typing channel:', typingChannelRef.current.topic);
        supabase.removeChannel(typingChannelRef.current);
        typingChannelRef.current = null;
        isTypingSubscribedRef.current = false;
      }
    };
  }, [currentUserId, recipientId, stableOnNewMessageReceived, stableOnRecipientTypingStatusChange]);

  const broadcastTyping = useCallback((isTyping: boolean) => {
    if (typingChannelRef.current && isTypingSubscribedRef.current) {
      typingChannelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { user_id: currentUserId, typing: isTyping }
      });
    } else {
      console.warn('Typing channel not ready for broadcast or not subscribed.');
    }
  }, [currentUserId]); // Removed typingChannelRef and isTypingSubscribedRef from deps as they are refs

  return { broadcastTyping };
};
