
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  MessageSquare, Send, AtSign, Pin, Heart, Reply, Clock, User, 
  Users, PlusCircle, Smile, Paperclip, MoreVertical, Edit3,
  Trash2, Copy, Hash, Zap, AlertCircle
} from "lucide-react";
import { useProjectMessages } from "@/hooks/useProjectMessages";
import { useParams } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface TeamDiscussionProps {
  projectId?: string;
  userId?: string;
}

const TeamDiscussion = ({ projectId, userId }: TeamDiscussionProps) => {
  const { id } = useParams();
  const finalProjectId = projectId || id || '';
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [mentionUser, setMentionUser] = useState("");
  const [pinnedMessages, setPinnedMessages] = useState<string[]>([]);
  const [likedMessages, setLikedMessages] = useState<string[]>([]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("");
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [onlineUsers] = useState(['Sarah', 'Mike', 'Alex', 'John']); // Mock online users
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, loading, sendMessage } = useProjectMessages(finalProjectId);

  const emojis = ['😀', '😂', '❤️', '👍', '👎', '🔥', '💯', '🎉', '🚀', '💪', '🎨', '✨'];
  const quickReplies = ['Thanks!', 'Looks good!', 'Need revision', 'Approved', 'Working on it', 'Almost done'];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const pinned = localStorage.getItem(`pinned-${finalProjectId}`);
    const liked = localStorage.getItem(`liked-${finalProjectId}`);
    if (pinned) setPinnedMessages(JSON.parse(pinned));
    if (liked) setLikedMessages(JSON.parse(liked));
  }, [finalProjectId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    let messageContent = newMessage;
    
    if (replyingTo) {
      messageContent = `@reply:${replyingTo} ${newMessage}`;
    }
    
    if (selectedEmoji) {
      messageContent = `${selectedEmoji} ${messageContent}`;
    }

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

  const startEditing = (messageId: string, content: string) => {
    setEditingMessage(messageId);
    setEditContent(content);
  };

  const cancelEditing = () => {
    setEditingMessage(null);
    setEditContent("");
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

  const getUserStatus = (username: string) => {
    return onlineUsers.includes(username) ? 'online' : 'offline';
  };

  const parseMessage = (content: string) => {
    const replyMatch = content.match(/^@reply:(\w+)\s(.+)/);
    if (replyMatch) {
      return {
        isReply: true,
        replyToId: replyMatch[1],
        content: replyMatch[2]
      };
    }

    const mentionRegex = /@(\w+)/g;
    const hashtagRegex = /#(\w+)/g;
    
    let processedContent = content;
    
    // Handle mentions
    processedContent = processedContent.replace(mentionRegex, (match, username) => 
      `<span class="mention">@${username}</span>`
    );
    
    // Handle hashtags
    processedContent = processedContent.replace(hashtagRegex, (match, tag) => 
      `<span class="hashtag">#${tag}</span>`
    );

    return {
      isReply: false,
      content: processedContent
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
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Team Discussion
              <Badge variant="outline" className="text-xs">
                {messages.length} messages
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-400" />
              <span className="text-sm text-green-400">{onlineUsers.length} online</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Online Users */}
            <div className="flex items-center gap-2 p-3 bg-gray-800/30 rounded-lg">
              <Users className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-400">Online now:</span>
              <div className="flex gap-2">
                {onlineUsers.map(user => (
                  <div key={user} className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm text-gray-300">{user}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pinned Messages */}
            {pinnedMessages.length > 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <h4 className="text-yellow-300 font-medium mb-3 flex items-center gap-2">
                  <Pin className="h-4 w-4" />
                  Pinned Messages ({pinnedMessages.length})
                </h4>
                <div className="space-y-2">
                  {messages
                    .filter(msg => pinnedMessages.includes(msg.id))
                    .slice(0, 3)
                    .map(msg => (
                      <div key={msg.id} className="text-sm text-gray-300 bg-gray-800/50 rounded p-3 border-l-2 border-yellow-400">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-yellow-300">
                            {msg.profiles?.first_name} {msg.profiles?.last_name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(msg.created_at)}
                          </span>
                        </div>
                        <p>{msg.content}</p>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="space-y-4 bg-gray-800/30 rounded-lg p-4 border border-gray-700 max-h-96 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-300 mb-2">Start the conversation</h3>
                  <p className="text-gray-400">Share updates, ask questions, and collaborate with your team.</p>
                </div>
              ) : (
                <>
                  {messages.map((message) => {
                    const parsedMessage = parseMessage(message.content);
                    const isLiked = likedMessages.includes(message.id);
                    const isPinned = pinnedMessages.includes(message.id);
                    const userStatus = getUserStatus(message.profiles?.first_name || '');
                    
                    return (
                      <div key={message.id} className={`flex gap-3 group hover:bg-gray-700/20 p-3 rounded-lg transition-colors ${parsedMessage.isReply ? 'ml-6 border-l-2 border-blue-500/50 pl-4' : ''}`}>
                        <div className="relative">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={message.profiles?.avatar_url} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-sm font-bold">
                              {message.profiles ? 
                                getInitials(message.profiles.first_name, message.profiles.last_name) : 
                                'U'
                              }
                            </AvatarFallback>
                          </Avatar>
                          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-800 ${userStatus === 'online' ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-medium truncate">
                              {message.profiles?.first_name} {message.profiles?.last_name}
                            </span>
                            {userStatus === 'online' && <div className="w-2 h-2 bg-green-400 rounded-full"></div>}
                            <div className="flex items-center gap-1 text-gray-400 text-xs">
                              <Clock className="h-3 w-3" />
                              {formatTimeAgo(message.created_at)}
                            </div>
                            {isPinned && <Pin className="h-3 w-3 text-yellow-400 fill-current" />}
                            {parsedMessage.isReply && <Reply className="h-3 w-3 text-blue-400" />}
                          </div>
                          
                          {editingMessage === message.id ? (
                            <div className="space-y-2">
                              <Textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="bg-gray-800 border-gray-600 text-white text-sm"
                              />
                              <div className="flex gap-2">
                                <Button size="sm" onClick={cancelEditing}>Save</Button>
                                <Button size="sm" variant="outline" onClick={cancelEditing}>Cancel</Button>
                              </div>
                            </div>
                          ) : (
                            <div 
                              className="text-gray-300 text-sm break-words"
                              dangerouslySetInnerHTML={{ 
                                __html: parsedMessage.content.replace(
                                  /class="mention"/g, 
                                  'class="bg-blue-500/20 text-blue-300 px-1 rounded"'
                                ).replace(
                                  /class="hashtag"/g,
                                  'class="bg-purple-500/20 text-purple-300 px-1 rounded"'
                                )
                              }}
                            />
                          )}
                          
                          {/* Message Actions */}
                          <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleLike(message.id)}
                              className={`h-7 px-2 ${isLiked ? 'text-red-400 bg-red-500/10' : 'text-gray-400'} hover:text-red-300`}
                            >
                              <Heart className={`h-3 w-3 ${isLiked ? 'fill-current' : ''}`} />
                              {likedMessages.filter(id => id === message.id).length || ''}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setReplyingTo(message.id)}
                              className="h-7 px-2 text-gray-400 hover:text-blue-300"
                            >
                              <Reply className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => togglePin(message.id)}
                              className={`h-7 px-2 ${isPinned ? 'text-yellow-400 bg-yellow-500/10' : 'text-gray-400'} hover:text-yellow-300`}
                            >
                              <Pin className="h-3 w-3" />
                            </Button>
                            
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-7 px-2 text-gray-400">
                                  <MoreVertical className="h-3 w-3" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-48 bg-gray-800 border-gray-600" align="end">
                                <div className="space-y-1">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="w-full justify-start text-gray-300"
                                    onClick={() => startEditing(message.id, message.content)}
                                  >
                                    <Edit3 className="h-3 w-3 mr-2" />
                                    Edit
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="w-full justify-start text-gray-300"
                                  >
                                    <Copy className="h-3 w-3 mr-2" />
                                    Copy
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="w-full justify-start text-red-400"
                                  >
                                    <Trash2 className="h-3 w-3 mr-2" />
                                    Delete
                                  </Button>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Typing Indicator */}
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
                </>
              )}
            </div>

            {/* Reply indicator */}
            {replyingTo && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Reply className="h-4 w-4 text-blue-400" />
                  <span className="text-blue-300 text-sm">Replying to message</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyingTo(null)}
                  className="h-6 text-gray-400"
                >
                  ✕
                </Button>
              </div>
            )}

            {/* Quick Replies */}
            <div className="flex flex-wrap gap-2">
              {quickReplies.map(reply => (
                <Button
                  key={reply}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickReply(reply)}
                  className="h-8 text-xs border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <Zap className="h-3 w-3 mr-1" />
                  {reply}
                </Button>
              ))}
            </div>

            {/* Message Input */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Textarea
                    placeholder="Type your message... Use @username for mentions, #hashtag for topics"
                    value={newMessage}
                    onChange={(e) => handleTyping(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                    className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none min-h-[60px]"
                    rows={2}
                  />
                  {selectedEmoji && (
                    <div className="absolute top-2 right-2 text-lg">
                      {selectedEmoji}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="border-gray-600">
                        <Smile className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 bg-gray-800 border-gray-600">
                      <div className="grid grid-cols-6 gap-2">
                        {emojis.map(emoji => (
                          <Button
                            key={emoji}
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedEmoji(emoji)}
                            className="h-8 text-lg hover:bg-gray-700"
                          >
                            {emoji}
                          </Button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                  
                  <Button variant="outline" size="sm" className="border-gray-600">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    size="sm" 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Mention helper */}
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="@username to mention..."
                  value={mentionUser}
                  onChange={(e) => setMentionUser(e.target.value)}
                  className="flex-1 bg-gray-800/50 border border-gray-600 text-white text-sm h-8"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (mentionUser.trim()) {
                      setNewMessage(prev => `${prev}@${mentionUser} `);
                      setMentionUser("");
                    }
                  }}
                  className="border-gray-600 h-8"
                >
                  <AtSign className="h-3 w-3 mr-1" />
                  Mention
                </Button>
              </div>
            </div>

            {/* Enhanced Discussion Stats */}
            <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
              <h4 className="text-white font-medium mb-4">Discussion Analytics</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-blue-400">{messages.length}</p>
                  <p className="text-gray-400 text-xs">Messages</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-yellow-400">{pinnedMessages.length}</p>
                  <p className="text-gray-400 text-xs">Pinned</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-red-400">{likedMessages.length}</p>
                  <p className="text-gray-400 text-xs">Reactions</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-green-400">{onlineUsers.length}</p>
                  <p className="text-gray-400 text-xs">Online</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamDiscussion;
