
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { ProjectMessage } from "@/hooks/useProjectMessages";
import { formatTimeAgo, getInitials, parseMessageContent, processMessageContent } from "@/utils/discussionUtils";
import { Clock, Copy, Edit3, Heart, MoreVertical, Pin, Reply, Trash2 } from "lucide-react";

interface MessageItemProps {
  message: ProjectMessage;
  isLiked: boolean;
  isPinned: boolean;
  userStatus: 'online' | 'offline';
  editingMessageId: string | null;
  editContent: string;
  onLike: (messageId: string) => void;
  onPin: (messageId: string) => void;
  onReply: (messageId: string) => void;
  onStartEdit: (messageId: string, content: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onDelete: (messageId: string) => void;
  onSetEditContent: (content: string) => void;
}

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isLiked,
  isPinned,
  userStatus,
  editingMessageId,
  editContent,
  onLike,
  onPin,
  onReply,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onSetEditContent,
}) => {
  const { content: rawContent, isReply } = parseMessageContent(message.content);
  const processedContent = processMessageContent(rawContent);

  return (
    <div className={`flex gap-3 group hover:bg-gray-700/20 p-3 rounded-lg transition-colors ${isReply ? 'ml-6 border-l-2 border-blue-500/50 pl-4' : ''}`}>
      <div className="relative">
        <Avatar className="w-10 h-10">
          <AvatarImage src={message.profiles?.avatar_url} />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-sm font-bold">
            {message.profiles ? getInitials(message.profiles.first_name, message.profiles.last_name) : 'U'}
          </AvatarFallback>
        </Avatar>
        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-800 ${userStatus === 'online' ? 'bg-green-400' : 'bg-gray-500'}`}></div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-white font-medium truncate">
            {message.profiles?.first_name} {message.profiles?.last_name}
          </span>
          <div className="flex items-center gap-1 text-gray-400 text-xs">
            <Clock className="h-3 w-3" />
            {formatTimeAgo(message.created_at)}
          </div>
          {isPinned && <Pin className="h-3 w-3 text-yellow-400 fill-current" />}
          {isReply && <Reply className="h-3 w-3 text-blue-400" />}
        </div>
        
        {editingMessageId === message.id ? (
          <div className="space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => onSetEditContent(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white text-sm"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={onSaveEdit}>Save</Button>
              <Button size="sm" variant="outline" onClick={onCancelEdit}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div 
            className="text-gray-300 text-sm break-words"
            dangerouslySetInnerHTML={{ __html: processedContent }}
          />
        )}
        
        <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="sm" onClick={() => onLike(message.id)} className={`h-7 px-2 ${isLiked ? 'text-red-400 bg-red-500/10' : 'text-gray-400'} hover:text-red-300`}>
            <Heart className={`h-3 w-3 ${isLiked ? 'fill-current' : ''}`} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onReply(message.id)} className="h-7 px-2 text-gray-400 hover:text-blue-300">
            <Reply className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onPin(message.id)} className={`h-7 px-2 ${isPinned ? 'text-yellow-400 bg-yellow-500/10' : 'text-gray-400'} hover:text-yellow-300`}>
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
                <Button variant="ghost" size="sm" className="w-full justify-start text-gray-300" onClick={() => onStartEdit(message.id, rawContent)}>
                  <Edit3 className="h-3 w-3 mr-2" /> Edit
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start text-gray-300" onClick={() => navigator.clipboard.writeText(rawContent)}>
                  <Copy className="h-3 w-3 mr-2" /> Copy
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start text-red-400" onClick={() => onDelete(message.id)}>
                  <Trash2 className="h-3 w-3 mr-2" /> Delete
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;

