
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import CommentsSection from './CommentsSection';

interface PostCardProps {
  post: {
    id: string;
    author_id: string;
    content: string;
    likes_count: number;
    comments_count: number;
    created_at: string;
    trending: boolean;
    author_profile: {
      first_name: string;
      last_name: string;
      avatar_url: string;
    };
  };
  onToggleLike: (postId: string) => void;
  currentUserId?: string;
}

const PostCard = ({ post, onToggleLike, currentUserId }: PostCardProps) => {
  const [showComments, setShowComments] = useState(false);
  
  const authorName = `${post.author_profile.first_name} ${post.author_profile.last_name}`.trim() || 'Anonymous';
  const avatarFallback = authorName.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <Card className="bg-gray-900/80 border-gray-700">
      <CardContent className="p-6">
        <div className="flex items-start space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.author_profile.avatar_url} />
            <AvatarFallback className="bg-blue-600 text-white">
              {avatarFallback}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-semibold text-white">{authorName}</h4>
                <p className="text-sm text-gray-400">
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  {post.trending && (
                    <span className="ml-2 text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded">
                      🔥 Trending
                    </span>
                  )}
                </p>
              </div>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-200 whitespace-pre-wrap">{post.content}</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleLike(post.id)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <Heart className="h-4 w-4 mr-1" />
                {post.likes_count}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowComments(!showComments)}
                className="text-gray-400 hover:text-blue-500 transition-colors"
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                {post.comments_count}
              </Button>
            </div>
            
            {showComments && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <CommentsSection postId={post.id} />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostCard;
