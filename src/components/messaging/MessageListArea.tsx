
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MessageItem from './MessageItem';
import type { DirectMessage } from "@/hooks/useSimpleDirectMessages";
import { getInitials } from '@/utils/messagingUtils';

interface MessageListAreaProps {
  messages: DirectMessage[];
  loading: boolean;
  currentUserId: string;
  recipientName: string;
  recipientAvatar?: string;
  otherUserTyping: boolean;
  scrollAreaRef: React.RefObject<HTMLDivElement>;
}

const MessageListArea: React.FC<MessageListAreaProps> = ({
  messages,
  loading,
  currentUserId,
  recipientName,
  recipientAvatar,
  otherUserTyping,
  scrollAreaRef,
}) => {
  return (
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
            const prevMessage = messages[index - 1];
            const showAvatar = !prevMessage || prevMessage.sender_id !== message.sender_id;
            const showTimestamp = !prevMessage || 
              new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime() > 5 * 60 * 1000;

            return (
              <MessageItem
                key={message.id}
                message={message}
                isOwn={isOwn}
                showAvatar={showAvatar}
                showTimestamp={showTimestamp}
              />
            );
          })}
          
          {otherUserTyping && !loading && messages.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
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
  );
};

export default MessageListArea;
