
import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useDirectMessages } from "@/hooks/useDirectMessages";
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
    sendMessage,
    broadcastTyping,
  } = useDirectMessages(currentUserId, recipientId, setOtherUserTyping);

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

    const success = await sendMessage(newMessage);
    if (success) {
      setNewMessage('');
      if (broadcastTyping) broadcastTyping(false); 
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);

    if (!broadcastTyping) return;

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
      onOpenChange(newOpenState);
      if (!newOpenState) {
        setOtherUserTyping(false); 
        if (broadcastTyping) broadcastTyping(false);
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
