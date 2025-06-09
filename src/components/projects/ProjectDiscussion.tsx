
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, AtSign, Pin, Heart, Reply, Clock, User } from "lucide-react";
import { useProjectMessages } from "@/hooks/useProjectMessages";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface ProjectDiscussionProps {
  projectId?: string;
  userId?: string;
}

const ProjectDiscussion = ({ projectId, userId }: ProjectDiscussionProps) => {
  const { id } = useParams();
  const finalProjectId = projectId || id || '';
  const [newMessage, setNewMessage] = useState("");
  const [mentionUser, setMentionUser] = useState("");
  const [pinnedMessages, setPinnedMessages] = useState<string[]>([]);
  const [likedMessages, setLikedMessages] = useState<string[]>([]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const { messages, loading, sendMessage } = useProjectMessages(finalProjectId);

  useEffect(() => {
    // Load pinned and liked messages from localStorage for demo
    const pinned = localStorage.getItem(`pinned-${finalProjectId}`);
    const liked = localStorage.getItem(`liked-${finalProjectId}`);
    if (pinned) setPinnedMessages(JSON.parse(pinned));
    if (liked) setLikedMessages(JSON.parse(liked));
  }, [finalProjectId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageContent = replyingTo 
      ? `@reply:${replyingTo} ${newMessage}` 
      : newMessage;

    await sendMessage(messageContent);
    setNewMessage("");
    setReplyingTo(null);
  };

  const handleMention = () => {
    if (mentionUser.trim()) {
      setNewMessage(prev => `${prev}@${mentionUser} `);
      setMentionUser("");
    }
  };

  const togglePin = (messageId: string) => {
    const updated = pinnedMessages.includes(messageId) 
      ? pinnedMessages.filter(id => id !== messageId)
      : [...pinnedMessages, messageId];
    setPinnedMessages(updated);
    localStorage.setItem(`pinned-${finalProjectId}`, JSON.stringify(updated));
  };

  const toggleLike = (messageId: string) => {
    const updated = likedMessages.includes(messageId)
      ? likedMessages.filter(id => id !== messageId)
      : [...likedMessages, messageId];
    setLikedMessages(updated);
    localStorage.setItem(`liked-${finalProjectId}`, JSON.stringify(updated));
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || 'U';
  };

  const parseMessage = (content: string) => {
    // Handle replies
    const replyMatch = content.match(/^@reply:(\w+)\s(.+)/);
    if (replyMatch) {
      return {
        isReply: true,
        replyToId: replyMatch[1],
        content: replyMatch[2]
      };
    }

    // Handle mentions
    const mentionRegex = /@(\w+)/g;
    const parts = content.split(mentionRegex);
    
    return {
      isReply: false,
      content: parts.map((part, index) => 
        index % 2 === 1 ? (
          <Badge key={index} variant="secondary" className="bg-blue-500/20 text-blue-300 mx-1">
            @{part}
          </Badge>
        ) : part
      )
    };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="bg-gray-900/50 border-gray-700">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-700 rounded w-1/3"></div>
              <div className="h-20 bg-gray-700 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Team Discussion
            <Badge variant="outline" className="ml-auto text-xs">
              {messages.length} messages
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-300">
              Collaborate with your team using real-time messaging. Share updates, ask questions, and coordinate work.
            </p>
            
            {/* Pinned Messages */}
            {pinnedMessages.length > 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <h4 className="text-yellow-300 font-medium mb-2 flex items-center gap-2">
                  <Pin className="h-4 w-4" />
                  Pinned Messages
                </h4>
                <div className="space-y-2">
                  {messages
                    .filter(msg => pinnedMessages.includes(msg.id))
                    .slice(0, 2)
                    .map(msg => (
                      <div key={msg.id} className="text-sm text-gray-300 bg-gray-800/50 rounded p-2">
                        <span className="font-medium text-yellow-300">
                          {msg.profiles?.first_name} {msg.profiles?.last_name}:
                        </span> {msg.content}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="space-y-4 bg-gray-800/50 rounded-lg p-4 border border-gray-700 max-h-96 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => {
                  const parsedMessage = parseMessage(message.content);
                  const isLiked = likedMessages.includes(message.id);
                  const isPinned = pinnedMessages.includes(message.id);
                  
                  return (
                    <div key={message.id} className={`flex gap-3 group ${parsedMessage.isReply ? 'ml-6 border-l-2 border-blue-500/50 pl-3' : ''}`}>
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {message.profiles ? 
                          getInitials(message.profiles.first_name, message.profiles.last_name) : 
                          <User className="h-4 w-4" />
                        }
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-medium">
                            {message.profiles?.first_name} {message.profiles?.last_name}
                          </span>
                          <div className="flex items-center gap-1 text-gray-400 text-xs">
                            <Clock className="h-3 w-3" />
                            {formatTimeAgo(message.created_at)}
                          </div>
                          {isPinned && <Pin className="h-3 w-3 text-yellow-400" />}
                        </div>
                        <p className="text-gray-300 text-sm">{parsedMessage.content}</p>
                        
                        {/* Message Actions */}
                        <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleLike(message.id)}
                            className={`h-6 px-2 ${isLiked ? 'text-red-400' : 'text-gray-400'} hover:text-red-300`}
                          >
                            <Heart className={`h-3 w-3 ${isLiked ? 'fill-current' : ''}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setReplyingTo(message.id)}
                            className="h-6 px-2 text-gray-400 hover:text-blue-300"
                          >
                            <Reply className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => togglePin(message.id)}
                            className={`h-6 px-2 ${isPinned ? 'text-yellow-400' : 'text-gray-400'} hover:text-yellow-300`}
                          >
                            <Pin className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Reply indicator */}
            {replyingTo && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-2 flex items-center justify-between">
                <span className="text-blue-300 text-sm">Replying to message</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyingTo(null)}
                  className="h-6 text-gray-400"
                >
                  Cancel
                </Button>
              </div>
            )}

            {/* Chat input */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input 
                  type="text" 
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
                <Button 
                  size="sm" 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Quick mention */}
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Username to mention..."
                  value={mentionUser}
                  onChange={(e) => setMentionUser(e.target.value)}
                  className="flex-1 bg-gray-800/50 border border-gray-600 text-white text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMention}
                  className="border-gray-600"
                >
                  <AtSign className="h-4 w-4 mr-1" />
                  Mention
                </Button>
              </div>
            </div>

            {/* Discussion Stats */}
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <h4 className="text-white font-medium mb-3">Discussion Stats</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-400">{messages.length}</p>
                  <p className="text-gray-400 text-xs">Total Messages</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-400">{pinnedMessages.length}</p>
                  <p className="text-gray-400 text-xs">Pinned</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-400">{likedMessages.length}</p>
                  <p className="text-gray-400 text-xs">Liked</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectDiscussion;
