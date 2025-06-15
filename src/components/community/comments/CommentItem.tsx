
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  author_profile: {
    first_name: string;
    last_name: string;
    avatar_url: string;
  };
}

interface CommentItemProps {
  comment: Comment;
}

const CommentItem = ({ comment }: CommentItemProps) => {
  const authorName = `${comment.author_profile?.first_name || ''} ${comment.author_profile?.last_name || ''}`.trim() || 'Anonymous';
  const avatarFallback = authorName.split(' ').map(n => n[0]).join('').toUpperCase() || 'A';
  
  return (
    <div className="flex space-x-3">
      <Avatar className="h-8 w-8">
        <AvatarImage src={comment.author_profile?.avatar_url} />
        <AvatarFallback className="bg-gray-600 text-white text-xs">
          {avatarFallback}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-medium text-white text-sm">{authorName}</span>
            <span className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
          </div>
          <p className="text-gray-200 text-sm">{comment.content}</p>
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
