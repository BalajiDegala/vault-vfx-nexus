
import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, MessageCircle } from "lucide-react";
import { useProjectMessages, type ProjectMessage } from "@/hooks/useProjectMessages";
import { format } from "date-fns";

function generateTempId() {
  return `temp-${Math.random().toString(36).substr(2, 9)}`;
}

interface ProjectChatProps {
  projectId: string;
  userId: string;
}

const ProjectChat = ({ projectId, userId }: ProjectChatProps) => {
  const [newMessage, setNewMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const { messages, loading, sendMessage } = useProjectMessages(projectId);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Local state for optimistic (pending) messages
  const [pendingMessages, setPendingMessages] = useState<
    { id: string; content: string; created_at: string; }[]
  >([]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, pendingMessages]);

  // Remove pending if confirmed arrives (matched by content, sender, and very close created_at)
  useEffect(() => {
    if (pendingMessages.length === 0) return;
    setPendingMessages(prev => {
      const confirmedContents = new Set(
        messages
          .filter((msg) => msg.sender_id === userId)
          .map((msg) => `${msg.content}|${msg.created_at}`)
      );
      return prev.filter(
        (pending) => {
          // Match only if same content and timestamp within 5 seconds
          return !messages.some(
            (serverMsg) =>
              serverMsg.sender_id === userId &&
              serverMsg.content === pending.content &&
              Math.abs(new Date(serverMsg.created_at).getTime() - new Date(pending.created_at).getTime()) < 5000
          );
        }
      );
    });
  }, [messages, userId, pendingMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Optimistically add a pending message
    const tempId = generateTempId();
    const tempMsg = {
      id: tempId,
      content: newMessage.trim(),
      created_at: new Date().toISOString(),
    };
    setPendingMessages((prev) => [...prev, tempMsg]);

    // Send to server (no change needed)
    await sendMessage(newMessage.trim());
    setNewMessage('');
  };

  const getMessageTypeStyle = (type: string) => {
    switch (type) {
      case 'system':
        return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
      case 'status_update':
        return 'bg-green-500/10 border-green-500/20 text-green-400';
      case 'file_upload':
        return 'bg-purple-500/10 border-purple-500/20 text-purple-400';
      default:
        return 'bg-gray-800 border-gray-700 text-white';
    }
  };

  if (!isExpanded) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsExpanded(true)}
          className="h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 h-96 bg-gray-900 border border-gray-700 rounded-lg shadow-xl flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <h3 className="font-semibold text-white">Project Chat</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(false)}
          className="text-gray-400 hover:text-white"
        >
          ×
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        {loading ? (
          <div className="text-center text-gray-400">Loading messages...</div>
        ) : messages.length === 0 && pendingMessages.length === 0 ? (
          <div className="text-center text-gray-400">No messages yet. Start the conversation!</div>
        ) : (
          <div className="space-y-3">
            {[...messages, ...pendingMessages.map(pm => ({
              id: pm.id,
              sender_id: userId,
              content: pm.content,
              created_at: pm.created_at,
              message_type: "text",
              metadata: {},
              profiles: undefined,
              pending: true,
            }))].sort((a, b) =>
              new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            ).map((message: ProjectMessage) => {
              const isOwn = message.sender_id === userId;
              const fullName = message.profiles
                ? `${message.profiles?.first_name || ''} ${message.profiles?.last_name || ''}`.trim()
                : 'You';
              const initials = fullName
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase() || '?';

              return (
                <div
                  key={message.id}
                  className={`flex items-start gap-2 ${isOwn ? 'flex-row-reverse' : ''} ${message.pending ? 'opacity-60' : ''}`}
                >
                  {!isOwn && (
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={message.profiles?.avatar_url} />
                      <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className={`flex-1 max-w-[70%] ${isOwn ? 'text-right' : ''}`}>
                    {!isOwn && (
                      <p className="text-xs text-gray-400 mb-1">{fullName}</p>
                    )}
                    
                    <div className={`p-2 rounded-lg border ${getMessageTypeStyle(message.message_type)}`}>
                      <p className="text-sm">{message.content}</p>
                      
                      {message.message_type !== 'text' && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          {message.message_type.replace('_', ' ')}
                        </Badge>
                      )}
                      {message.pending && (
                        <span className="ml-2 text-xs text-gray-400 animate-pulse">Sending…</span>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(message.created_at), 'HH:mm')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="bg-gray-800 border-gray-600 text-white"
          />
          <Button type="submit" size="sm" disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProjectChat;
