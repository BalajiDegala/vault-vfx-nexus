
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { DirectMessage } from "@/hooks/useSimpleDirectMessages";
import { getInitials, formatMessageTime } from '@/utils/messagingUtils';

interface MessageItemProps {
  message: DirectMessage;
  isOwn: boolean;
  showAvatar: boolean;
  showTimestamp: boolean;
  // currentUserId: string; // Not directly used if sender_profile is reliable
  // recipientName: string; // For fallback if needed, but sender_profile should be primary
  // recipientAvatar?: string; // For fallback if needed
}

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isOwn,
  showAvatar,
  showTimestamp,
}) => {
  const senderName = message.sender_profile
    ? `${message.sender_profile.first_name || ''} ${message.sender_profile.last_name || ''}`.trim() || 'User'
    : 'User';

  return (
    <div className="space-y-1">
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
};

export default MessageItem;
