import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Edit3, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import CommentsSection from './CommentsSection';
import ErrorBoundary from './ErrorBoundary';
import EnhancedPostContentParser from './EnhancedPostContentParser';
import PostEngagement from './PostEngagement';
import AttachmentDisplay from './AttachmentDisplay';
import { POST_CATEGORIES } from './PostCategories';
import { CommunityPost } from '@/types/community';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


interface PostCardProps {
  post: CommunityPost;
  onToggleLike: (postId: string) => void;
  onToggleBookmark: (postId: string) => void; // Added
  onHashtagClick?: (hashtag: string) => void;
  onMentionClick?: (mention: string) => void;
  onMessageUser?: (profile: any) => void;
  currentUserId?: string;
  onEditPost: (post: CommunityPost) => void;
  onDeletePost: (postId: string, attachments: any[] | undefined) => void;
}

const PostCard = ({ 
  post, 
  onToggleLike, 
  onToggleBookmark, // Added
  onHashtagClick, 
  onMentionClick, 
  onMessageUser,
  currentUserId,
  onEditPost,
  onDeletePost
}: PostCardProps) => {
  const [showComments, setShowComments] = useState(false);
  
  const authorName = `${post.author_profile.first_name} ${post.author_profile.last_name}`.trim() || 'Anonymous';
  const avatarFallback = authorName.split(' ').map(n => n[0]).join('').toUpperCase();
  
  const categoryInfo = POST_CATEGORIES.find(cat => cat.id === post.category) || POST_CATEGORIES.find(cat => cat.id === 'general');
  const isAuthor = currentUserId === post.author_id;

  const handleToggleComments = () => {
    console.log('Toggling comments for post:', post.id);
    setShowComments(!showComments);
  };

  const handleShare = (postId: string) => {
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


  return (
    <ErrorBoundary>
      <Card className="bg-gray-900/80 border-gray-700 text-white">
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
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm text-gray-400">
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                      {post.updated_at && new Date(post.updated_at).getTime() !== new Date(post.created_at).getTime() && (
                        <span className="text-xs text-gray-500 italic ml-1">(edited)</span>
                      )}
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
                {isAuthor && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white" align="end">
                      <DropdownMenuItem onClick={() => onEditPost(post)} className="hover:!bg-gray-700 cursor-pointer">
                        <Edit3 className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDeletePost(post.id, post.attachments)} className="text-red-400 hover:!bg-red-500/20 hover:!text-red-300 cursor-pointer">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
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
                bookmarksCount={post.bookmarks_count || 0} // Pass bookmarks_count
                isLiked={post.is_liked} // Assuming is_liked is fetched (add to types if not)
                isBookmarked={post.is_bookmarked} // Pass is_bookmarked
                onToggleLike={onToggleLike}
                onToggleComments={handleToggleComments}
                onToggleBookmark={onToggleBookmark} // Pass onToggleBookmark
                onShare={() => handleShare(post.id)} // Pass handleShare with postId
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
