
import logger from "@/lib/logger";
import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useSimpleDirectMessages } from "@/hooks/useSimpleDirectMessages";
import DirectMessagingHeader from './DirectMessagingHeader';
import MessageListArea from './MessageListArea';
import MessageInputForm from './MessageInputForm';

interface DirectMessagingProps {
  currentUserId: string;
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DirectMessaging = ({ 
  currentUserId, 
  recipientId, 
  recipientName, 
  recipientAvatar,
  open, 
  onOpenChange 
}: DirectMessagingProps) => {
  const [newMessage, setNewMessage] = useState('');
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const {
    messages,
    loading,
    isRealtimeConnected,
    sendMessage,
    broadcastTyping,
  } = useSimpleDirectMessages(currentUserId, recipientId, setOtherUserTyping);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
    if (!open) {
      setOtherUserTyping(false); 
    }
  }, [open]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    logger.log('📤 Sending message:', newMessage);
    const success = await sendMessage(newMessage);
    if (success) {
      setNewMessage('');
      broadcastTyping(false); 
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);

    if (value.trim()) {
      broadcastTyping(true);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        broadcastTyping(false);
      }, 2000);
    } else {
      broadcastTyping(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpenState) => {
      logger.log('🔄 Dialog state changing to:', newOpenState);
      onOpenChange(newOpenState);
      if (!newOpenState) {
        setOtherUserTyping(false); 
        broadcastTyping(false);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      }
    }}>
      <DialogContent className="max-w-md h-[600px] bg-gray-900 border-gray-700 flex flex-col p-0">
        <DirectMessagingHeader
          recipientName={recipientName}
          recipientAvatar={recipientAvatar}
          otherUserTyping={otherUserTyping}
        />
        
        {/* Connection status indicator */}
        {!isRealtimeConnected && (
          <div className="px-4 py-2 bg-yellow-600/20 border-b border-gray-700">
            <div className="text-xs text-yellow-400 flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              Using backup sync (messages may be delayed)
            </div>
          </div>
        )}
        
        <MessageListArea
          messages={messages}
          loading={loading}
          currentUserId={currentUserId}
          recipientName={recipientName}
          recipientAvatar={recipientAvatar}
          otherUserTyping={otherUserTyping}
          scrollAreaRef={scrollAreaRef}
        />
        <MessageInputForm
          newMessage={newMessage}
          onNewMessageChange={handleInputChange}
          onSubmit={handleSendMessage}
          inputRef={inputRef}
          recipientName={recipientName}
          isSendingDisabled={!newMessage.trim()}
        />
      </DialogContent>
    </Dialog>
  );
};

export default DirectMessaging;
