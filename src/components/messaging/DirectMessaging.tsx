import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Send, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import { useDirectMessages } from "@/hooks/useDirectMessages";

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
  const [otherUserTyping, setOtherUserTyping] = useState(false); // Manages recipient's typing state
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const {
    messages,
    loading,
    // typing, // This is current user's typing state, managed by useDirectMessages
    // setTyping, // Setter for current user's typing state
    sendMessage,
    broadcastTyping, // This is used to broadcast current user's typing
    // subscribeToTyping, // This is no longer returned / used directly here
  } = useDirectMessages(currentUserId, recipientId, setOtherUserTyping); // Pass setOtherUserTyping as callback

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // This useEffect is no longer needed as useMessageSubscriptionManager handles typing subscriptions internally
  // useEffect(() => {
  //   if (open) {
  //     const unsubscribeTyping = subscribeToTyping(setOtherUserTyping);
  //     return unsubscribeTyping;
  //   }
  // }, [open, subscribeToTyping]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
    if (!open) {
      // Reset recipient typing state when dialog closes
      setOtherUserTyping(false); 
    }
  }, [open]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const success = await sendMessage(newMessage);
    if (success) {
      setNewMessage('');
      // Inform that current user stopped typing after sending a message
      if (broadcastTyping) broadcastTyping(false); 
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);

    if (!broadcastTyping) return; // Guard if broadcastTyping is not yet available

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

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return format(date, 'HH:mm');
    } else if (diffInHours < 48) {
      return 'Yesterday ' + format(date, 'HH:mm');
    } else {
      return format(date, 'MMM d, HH:mm');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpenState) => {
      onOpenChange(newOpenState);
      if (!newOpenState) {
        // Ensure typing indicator for recipient is cleared if modal is closed externally
        setOtherUserTyping(false); 
        // Optionally, also broadcast that current user stopped typing
        if (broadcastTyping) broadcastTyping(false);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      }
    }}>
      <DialogContent className="max-w-md h-[600px] bg-gray-900 border-gray-700 flex flex-col p-0">
        <DialogHeader className="p-4 border-b border-gray-700 flex-shrink-0">
          <DialogTitle className="text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={recipientAvatar} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                  {getInitials(recipientName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <span className="font-semibold">{recipientName}</span>
                {otherUserTyping && (
                  <div className="text-xs text-blue-400 animate-pulse">typing...</div>
                )}
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 p-4 min-h-0" ref={scrollAreaRef}>
          {loading ? (
            <div className="text-center text-gray-400 py-8">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <div className="mb-2">No messages yet</div>
              <div className="text-sm">Start the conversation with {recipientName}!</div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => {
                const isOwn = message.sender_id === currentUserId;
                const senderName = message.sender_profile 
                  ? `${message.sender_profile.first_name || ''} ${message.sender_profile.last_name || ''}`.trim()
                  : 'Unknown';
                
                const prevMessage = messages[index - 1];
                const showAvatar = !prevMessage || prevMessage.sender_id !== message.sender_id;
                const showTimestamp = !prevMessage || 
                  new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime() > 5 * 60 * 1000;

                return (
                  <div key={message.id} className="space-y-1">
                    {showTimestamp && (
                      <div className="text-center">
                        <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
                          {formatMessageTime(message.created_at)}
                        </span>
                      </div>
                    )}
                    
                    <div className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
                      {!isOwn && showAvatar ? (
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={message.sender_profile?.avatar_url} />
                          <AvatarFallback className="text-xs bg-gray-700 text-white">
                            {getInitials(senderName)}
                          </AvatarFallback>
                        </Avatar>
                      ) : !isOwn ? (
                        <div className="w-6" />
                      ) : null}
                      
                      <div className={`max-w-[70%] ${isOwn ? 'text-right' : ''}`}>
                        <div className={`inline-block p-3 rounded-2xl ${
                          isOwn 
                            ? 'bg-blue-600 text-white rounded-br-md' 
                            : 'bg-gray-800 text-gray-200 rounded-bl-md'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {otherUserTyping && !loading && messages.length > 0 && ( // Only show if not loading and there are messages
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={recipientAvatar} />
                    <AvatarFallback className="text-xs bg-gray-700 text-white">
                      {getInitials(recipientName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-800 text-gray-200 rounded-2xl rounded-bl-md px-4 py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700 flex-shrink-0">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={handleInputChange}
              placeholder={`Message ${recipientName}...`}
              className="bg-gray-800 border-gray-600 text-white rounded-full px-4"
              maxLength={1000}
            />
            <Button 
              type="submit" 
              size="sm" 
              disabled={!newMessage.trim()}
              className="rounded-full px-3 bg-blue-600 hover:bg-blue-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DirectMessaging;
