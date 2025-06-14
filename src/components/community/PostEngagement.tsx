
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';

interface PostEngagementProps {
  postId: string;
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  onToggleLike: (postId: string) => void;
  onToggleComments: () => void;
  onShare?: (postId: string) => void;
  onBookmark?: (postId: string) => void;
}

const PostEngagement = ({
  postId,
  likesCount,
  commentsCount,
  isLiked = false,
  isBookmarked = false,
  onToggleLike,
  onToggleComments,
  onShare,
  onBookmark
}: PostEngagementProps) => {
  const [localIsLiked, setLocalIsLiked] = useState(isLiked);
  const [localIsBookmarked, setLocalIsBookmarked] = useState(isBookmarked);

  const handleLike = () => {
    setLocalIsLiked(!localIsLiked);
    onToggleLike(postId);
  };

  const handleBookmark = () => {
    if (onBookmark) {
      setLocalIsBookmarked(!localIsBookmarked);
      onBookmark(postId);
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare(postId);
    } else {
      // Default share behavior
      if (navigator.share) {
        navigator.share({
          title: 'VFX Community Post',
          url: `${window.location.origin}/community?post=${postId}`
        });
      } else {
        navigator.clipboard.writeText(`${window.location.origin}/community?post=${postId}`);
      }
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          className={`transition-colors ${
            localIsLiked 
              ? 'text-red-500 hover:text-red-400' 
              : 'text-gray-400 hover:text-red-500'
          }`}
        >
          <Heart className={`h-4 w-4 mr-1 ${localIsLiked ? 'fill-current' : ''}`} />
          {likesCount}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleComments}
          className="text-gray-400 hover:text-blue-500 transition-colors"
        >
          <MessageCircle className="h-4 w-4 mr-1" />
          {commentsCount}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          className="text-gray-400 hover:text-green-500 transition-colors"
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </div>

      {onBookmark && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBookmark}
          className={`transition-colors ${
            localIsBookmarked 
              ? 'text-yellow-500 hover:text-yellow-400' 
              : 'text-gray-400 hover:text-yellow-500'
          }`}
        >
          <Bookmark className={`h-4 w-4 ${localIsBookmarked ? 'fill-current' : ''}`} />
        </Button>
      )}
    </div>
  );
};

export default PostEngagement;
