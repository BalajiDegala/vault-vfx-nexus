
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useMessageSubscriptionManager } from './useMessageSubscriptionManager';

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

export const useDirectMessages = (
  currentUserId: string, 
  recipientId: string,
  onRecipientTyping: (isTyping: boolean) => void // Callback from component
) => {
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false); // Current user's typing state
  const { toast } = useToast();

  const fetchMessages = useCallback(async () => {
    if (!currentUserId || !recipientId) return;
    
    console.log(`Fetching messages between ${currentUserId} and ${recipientId}`);
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
  }, [currentUserId, recipientId, toast]);

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
      // New messages will be fetched via subscription, or manually if needed
      // fetchMessages(); // Optionally, fetch immediately for quicker update
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
    fetchMessages, // Callback when a new message is received
    onRecipientTyping // Callback when recipient's typing status changes
  );

  useEffect(() => {
    if (!currentUserId || !recipientId) {
      setMessages([]); // Clear messages if IDs are not valid
      return;
    }
    
    console.log('useDirectMessages effect: Initial fetch for', currentUserId, recipientId);
    fetchMessages();
    // Subscriptions are handled by useMessageSubscriptionManager's internal useEffect
  }, [currentUserId, recipientId, fetchMessages]);

  return {
    messages,
    loading,
    typing, // Current user's typing state
    setTyping, // Setter for current user's typing state
    sendMessage,
    broadcastTyping: broadcastUserTypingActivity, // Expose the broadcast function from the manager
    refreshMessages: fetchMessages
  };
};
