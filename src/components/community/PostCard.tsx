
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import CommentsSection from './CommentsSection';
import ErrorBoundary from './ErrorBoundary';
import EnhancedPostContentParser from './EnhancedPostContentParser';
import PostEngagement from './PostEngagement';
import AttachmentDisplay from './AttachmentDisplay';
import { POST_CATEGORIES } from './PostCategories';

interface PostCardProps {
  post: {
    id: string;
    author_id: string;
    content: string;
    likes_count: number;
    comments_count: number;
    created_at: string;
    trending: boolean;
    category?: string;
    attachments?: any[];
    author_profile: {
      first_name: string;
      last_name: string;
      avatar_url: string;
    };
  };
  onToggleLike: (postId: string) => void;
  onHashtagClick?: (hashtag: string) => void;
  onMentionClick?: (mention: string) => void;
  onMessageUser?: (profile: any) => void;
  currentUserId?: string;
}

const PostCard = ({ 
  post, 
  onToggleLike, 
  onHashtagClick, 
  onMentionClick, 
  onMessageUser,
  currentUserId 
}: PostCardProps) => {
  const [showComments, setShowComments] = useState(false);
  
  const authorName = `${post.author_profile.first_name} ${post.author_profile.last_name}`.trim() || 'Anonymous';
  const avatarFallback = authorName.split(' ').map(n => n[0]).join('').toUpperCase();
  
  const categoryInfo = POST_CATEGORIES.find(cat => cat.id === post.category) || POST_CATEGORIES.find(cat => cat.id === 'general');

  const handleToggleComments = () => {
    console.log('Toggling comments for post:', post.id);
    setShowComments(!showComments);
  };

  const handleShare = (postId: string) => {
    // Custom share logic
    if (navigator.share) {
      navigator.share({
        title: `${authorName}'s VFX post`,
        text: post.content,
        url: `${window.location.origin}/community?post=${postId}`
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/community?post=${postId}`);
    }
  };

  const handleBookmark = (postId: string) => {
    // TODO: Implement bookmark functionality
    console.log('Bookmarking post:', postId);
  };

  return (
    <ErrorBoundary>
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
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-400">
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </p>
                    {post.category && categoryInfo && (
                      <Badge className={`${categoryInfo.color} text-white text-xs`}>
                        {categoryInfo.label}
                      </Badge>
                    )}
                    {post.trending && (
                      <Badge className="bg-orange-500/20 text-orange-400 text-xs">
                        🔥 Trending
                      </Badge>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="mb-4">
                <EnhancedPostContentParser 
                  content={post.content}
                  onHashtagClick={onHashtagClick}
                  onMentionClick={onMentionClick}
                  onMessageUser={onMessageUser}
                  currentUserId={currentUserId}
                />
              </div>

              {post.attachments && post.attachments.length > 0 && (
                <AttachmentDisplay attachments={post.attachments} />
              )}
              
              <PostEngagement
                postId={post.id}
                likesCount={post.likes_count}
                commentsCount={post.comments_count}
                onToggleLike={onToggleLike}
                onToggleComments={handleToggleComments}
                onShare={handleShare}
                onBookmark={handleBookmark}
              />
              
              {showComments && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <ErrorBoundary fallback={
                    <div className="text-center text-red-400 py-4">
                      <p>Failed to load comments</p>
                      <Button onClick={() => setShowComments(false)} variant="outline" size="sm" className="mt-2">
                        Close Comments
                      </Button>
                    </div>
                  }>
                    <CommentsSection postId={post.id} />
                  </ErrorBoundary>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </ErrorBoundary>
  );
};

export default PostCard;
