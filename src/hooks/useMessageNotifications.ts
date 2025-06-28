
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface MessageNotification {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  content: string;
  created_at: string;
}

export const useMessageNotifications = (currentUserId: string) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastReadTimestamp, setLastReadTimestamp] = useState<string>(
    localStorage.getItem(`lastReadMessages_${currentUserId}`) || new Date().toISOString()
  );
  const { toast } = useToast();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const currentUserIdRef = useRef<string>(currentUserId);

  const updateLastRead = () => {
    const now = new Date().toISOString();
    setLastReadTimestamp(now);
    localStorage.setItem(`lastReadMessages_${currentUserId}`, now);
    setUnreadCount(0);
  };

  const checkUnreadMessages = async () => {
    if (!currentUserId) return;

    try {
      const { data, error } = await supabase
        .from('direct_messages')
        .select(`
          id,
          sender_id,
          content,
          created_at,
          sender_profile:profiles!sender_id (
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('receiver_id', currentUserId)
        .gt('created_at', lastReadTimestamp)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUnreadCount(data?.length || 0);
    } catch (error) {
      console.error('Error checking unread messages:', error);
    }
  };

  useEffect(() => {
    // Clean up if currentUserId changed
    if (currentUserIdRef.current !== currentUserId) {
      if (channelRef.current) {
        console.log('Cleaning up message notifications channel due to user change');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      currentUserIdRef.current = currentUserId;
    }

    if (!currentUserId) return;

    console.log('Setting up message notifications for user:', currentUserId);

    // Check unread messages initially
    checkUnreadMessages();
    
    // Only create a new channel if we don't have one
    if (!channelRef.current) {
      // Create new channel
      const channelName = `message_notifications_${currentUserId}_${Date.now()}`;
      const channel = supabase.channel(channelName);
      channelRef.current = channel;

      // Configure the channel
      channel
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'direct_messages',
            filter: `receiver_id=eq.${currentUserId}`
          },
          async (payload) => {
            console.log('New message notification:', payload);
            
            // Fetch sender profile for notification
            const { data: senderData } = await supabase
              .from('profiles')
              .select('first_name, last_name, avatar_url')
              .eq('id', payload.new.sender_id)
              .single();

            const senderName = senderData 
              ? `${senderData.first_name || ''} ${senderData.last_name || ''}`.trim() || 'Someone'
              : 'Someone';

            // Show toast notification
            toast({
              title: `💬 New message from ${senderName}`,
              description: payload.new.content.length > 50 
                ? payload.new.content.substring(0, 50) + '...'
                : payload.new.content,
              duration: 5000,
            });

            // Update unread count
            setUnreadCount(prev => prev + 1);
          }
        )
        .subscribe((status) => {
          console.log('Message notifications channel subscription status:', status);
        });
    }

    // Return cleanup function
    return () => {
      if (channelRef.current) {
        console.log('Component unmounting - cleaning up message notifications channel');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [currentUserId, toast, lastReadTimestamp]);

  return {
    unreadCount,
    updateLastRead,
    checkUnreadMessages
  };
};
