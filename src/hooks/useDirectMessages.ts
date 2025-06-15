
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useMessageSubscriptionManager } from './useMessageSubscriptionManager';

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

export const useDirectMessages = (
  currentUserId: string, 
  recipientId: string,
  onRecipientTyping: (isTyping: boolean) => void
) => {
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const { toast } = useToast();

  const fetchMessages = useCallback(async () => {
    if (!currentUserId || !recipientId) return;
    
    console.log(`📥 Fetching messages between ${currentUserId} and ${recipientId}`);
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
      
      console.log(`📥 Loaded ${transformedMessages.length} messages`);
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
  }, [currentUserId, recipientId, toast]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || !currentUserId || !recipientId) return false;

    console.log(`📤 Sending message from ${currentUserId} to ${recipientId}`);
    try {
      const { error } = await supabase
        .from('direct_messages')
        .insert({
          sender_id: currentUserId,
          receiver_id: recipientId,
          content: content.trim()
        });

      if (error) throw error;
      
      console.log('✅ Message sent successfully');
      // Note: Real-time subscription will handle updating the UI
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

  // Use the subscription manager for realtime events
  const { broadcastTyping: broadcastUserTypingActivity } = useMessageSubscriptionManager(
    currentUserId,
    recipientId,
    fetchMessages, // This will be called when new messages are received
    onRecipientTyping // This will be called when recipient typing status changes
  );

  useEffect(() => {
    if (!currentUserId || !recipientId) {
      setMessages([]);
      return;
    }
    
    console.log('🔄 useDirectMessages effect: Initial fetch for', currentUserId, recipientId);
    fetchMessages();
  }, [currentUserId, recipientId, fetchMessages]);

  return {
    messages,
    loading,
    typing,
    setTyping,
    sendMessage,
    broadcastTyping: broadcastUserTypingActivity,
    refreshMessages: fetchMessages
  };
};
