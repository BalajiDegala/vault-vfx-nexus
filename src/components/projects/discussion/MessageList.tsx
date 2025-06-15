
import { MessageSquare } from "lucide-react";
import { ProjectMessage } from "@/hooks/useProjectMessages";
import MessageItem from "./MessageItem";
import { useRef, useEffect } from "react";

interface MessageListProps {
  messages: ProjectMessage[];
  onlineUsers: string[];
  likedMessages: string[];
  pinnedMessages: string[];
  editingMessageId: string | null;
  editContent: string;
  typingUsers: string[];
  toggleLike: (id: string) => void;
  togglePin: (id: string) => void;
  setReplyingTo: (id: string | null) => void;
  startEditing: (id: string, content: string) => void;
  cancelEditing: () => void;
  handleSaveEdit: () => void;
  handleDeleteMessage: (id: string) => void;
  setEditContent: (content: string) => void;
}

const MessageList: React.FC<MessageListProps> = ({
  messages, onlineUsers, likedMessages, pinnedMessages, editingMessageId,
  editContent, typingUsers, toggleLike, togglePin, setReplyingTo,
  startEditing, cancelEditing, handleSaveEdit, handleDeleteMessage, setEditContent
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const getUserStatus = (username: string) => onlineUsers.includes(username) ? 'online' : 'offline';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-16 w-16 text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-300 mb-2">Start the conversation</h3>
        <p className="text-gray-400">Share updates, ask questions, and collaborate with your team.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 bg-gray-800/30 rounded-lg p-4 border border-gray-700 max-h-96 overflow-y-auto">
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          isLiked={likedMessages.includes(message.id)}
          isPinned={pinnedMessages.includes(message.id)}
          userStatus={getUserStatus(message.profiles?.first_name || '')}
          editingMessageId={editingMessageId}
          editContent={editContent}
          onLike={toggleLike}
          onPin={togglePin}
          onReply={setReplyingTo}
          onStartEdit={startEditing}
          onCancelEdit={cancelEditing}
          onSaveEdit={handleSaveEdit}
          onDelete={handleDeleteMessage}
          onSetEditContent={setEditContent}
        />
      ))}
      
      {typingUsers.length > 0 && (
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
          </div>
          <span>{typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...</span>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;

