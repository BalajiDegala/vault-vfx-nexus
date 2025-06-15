
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Reply } from "lucide-react";
import { useProjectMessages, ProjectMessage } from "@/hooks/useProjectMessages";
import DiscussionHeader from "./discussion/DiscussionHeader";
import OnlineUsers from "./discussion/OnlineUsers";
import PinnedMessages from "./discussion/PinnedMessages";
import MessageList from "./discussion/MessageList";
import QuickReplies from "./discussion/QuickReplies";
import MessageInput from "./discussion/MessageInput";
import DiscussionAnalytics from "./discussion/DiscussionAnalytics";

interface TeamDiscussionProps {
  projectId?: string;
  userId?: string;
}

const TeamDiscussion = ({ projectId }: TeamDiscussionProps) => {
  const { id } = useParams();
  const finalProjectId = projectId || id || '';
  
  const { messages, loading, sendMessage, updateMessage, deleteMessage } = useProjectMessages(finalProjectId);
  
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [pinnedMessages, setPinnedMessages] = useState<string[]>([]);
  const [likedMessages, setLikedMessages] = useState<string[]>([]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("");
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [onlineUsers] = useState(['Sarah', 'Mike', 'Alex', 'John']); // Mock online users

  useEffect(() => {
    const pinned = localStorage.getItem(`pinned-${finalProjectId}`);
    const liked = localStorage.getItem(`liked-${finalProjectId}`);
    if (pinned) setPinnedMessages(JSON.parse(pinned));
    if (liked) setLikedMessages(JSON.parse(liked));
  }, [finalProjectId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    let messageContent = replyingTo ? `@reply:${replyingTo} ${newMessage}` : newMessage;
    if (selectedEmoji) messageContent = `${selectedEmoji} ${messageContent}`;
    await sendMessage(messageContent);
    setNewMessage("");
    setReplyingTo(null);
    setSelectedEmoji("");
    setIsTyping(false);
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);
    if (!isTyping && value.length > 0) {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 2000);
    }
  };

  const handleQuickReply = (reply: string) => {
    setNewMessage(reply);
    handleSendMessage();
  };

  const togglePin = (messageId: string) => {
    const updated = pinnedMessages.includes(messageId) 
      ? pinnedMessages.filter(id => id !== messageId) : [...pinnedMessages, messageId];
    setPinnedMessages(updated);
    localStorage.setItem(`pinned-${finalProjectId}`, JSON.stringify(updated));
  };

  const toggleLike = (messageId: string) => {
    const updated = likedMessages.includes(messageId)
      ? likedMessages.filter(id => id !== messageId) : [...likedMessages, messageId];
    setLikedMessages(updated);
    localStorage.setItem(`liked-${finalProjectId}`, JSON.stringify(updated));
  };

  const startEditing = (messageId: string, content: string) => {
    setEditingMessage(messageId);
    setEditContent(content);
  };

  const cancelEditing = () => {
    setEditingMessage(null);
    setEditContent("");
  };
  
  const handleSaveEdit = async () => {
    if (editingMessage) {
      await updateMessage(editingMessage, editContent);
      cancelEditing();
    }
  };
  
  const handleDeleteMessage = async (messageId: string) => {
    await deleteMessage(messageId);
  }

  if (loading) {
    return (
      <Card className="bg-gray-900/50 border-gray-700">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-700 rounded w-1/3"></div>
            <div className="h-20 bg-gray-700 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900/50 border-gray-700">
      <DiscussionHeader messageCount={messages.length} onlineUserCount={onlineUsers.length} />
      <CardContent className="space-y-6">
        <OnlineUsers onlineUsers={onlineUsers} />
        <PinnedMessages messages={messages} pinnedMessageIds={pinnedMessages} />
        <MessageList 
          messages={messages}
          onlineUsers={onlineUsers}
          likedMessages={likedMessages}
          pinnedMessages={pinnedMessages}
          editingMessageId={editingMessage}
          editContent={editContent}
          typingUsers={typingUsers}
          toggleLike={toggleLike}
          togglePin={togglePin}
          setReplyingTo={setReplyingTo}
          startEditing={startEditing}
          cancelEditing={cancelEditing}
          handleSaveEdit={handleSaveEdit}
          handleDeleteMessage={handleDeleteMessage}
          setEditContent={setEditContent}
        />
        {replyingTo && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Reply className="h-4 w-4 text-blue-400" />
              <span className="text-blue-300 text-sm">Replying to message</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)} className="h-6 text-gray-400">✕</Button>
          </div>
        )}
        <QuickReplies onQuickReply={handleQuickReply} />
        <MessageInput 
          newMessage={newMessage}
          onNewMessageChange={handleTyping}
          onSendMessage={handleSendMessage}
          selectedEmoji={selectedEmoji}
          onEmojiSelect={setSelectedEmoji}
        />
        <DiscussionAnalytics 
          messageCount={messages.length}
          pinnedCount={pinnedMessages.length}
          likedCount={likedMessages.length}
          onlineCount={onlineUsers.length}
        />
      </CardContent>
    </Card>
  );
};

export default TeamDiscussion;

