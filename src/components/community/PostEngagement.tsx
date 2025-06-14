import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';

interface PostEngagementProps {
  postId: string;
  likesCount: number;
  commentsCount: number;
  bookmarksCount: number; // Added
  isLiked?: boolean;
  isBookmarked?: boolean; // Added
  onToggleLike: (postId: string) => void;
  onToggleComments: () => void;
  onToggleBookmark: (postId: string) => void; // Added
  onShare?: (postId: string) => void;
  // onBookmark prop was previously used for a local bookmark handler, renaming to onToggleBookmark to align with new global state
}

const PostEngagement = ({
  postId,
  likesCount,
  commentsCount,
  bookmarksCount, // Added
  isLiked = false,
  isBookmarked = false, // Added
  onToggleLike,
  onToggleComments,
  onToggleBookmark, // Added
  onShare,
}: PostEngagementProps) => {
  // Local state for immediate UI feedback, props will update from parent
  const [localIsLiked, setLocalIsLiked] = useState(isLiked);
  const [localIsBookmarked, setLocalIsBookmarked] = useState(isBookmarked);

  useEffect(() => {
    setLocalIsLiked(isLiked);
  }, [isLiked]);

  useEffect(() => {
    setLocalIsBookmarked(isBookmarked);
  }, [isBookmarked]);


  const handleLike = () => {
    // setLocalIsLiked(!localIsLiked); // Optimistic update handled by parent re-render
    onToggleLike(postId);
  };

  const handleBookmarkToggle = () => {
    // setLocalIsBookmarked(!localIsBookmarked); // Optimistic update handled by parent re-render
    onToggleBookmark(postId);
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
    <div className="flex items-center justify-between pt-2">
      <div className="flex items-center space-x-2 sm:space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          className={`transition-colors flex items-center ${
            localIsLiked 
              ? 'text-red-500 hover:text-red-400' 
              : 'text-gray-400 hover:text-red-500'
          }`}
          aria-pressed={localIsLiked}
          aria-label={localIsLiked ? "Unlike post" : "Like post"}
        >
          <Heart className={`h-4 w-4 mr-1 ${localIsLiked ? 'fill-current' : ''}`} />
          <span className="text-xs">{likesCount}</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleComments}
          className="text-gray-400 hover:text-blue-500 transition-colors flex items-center"
          aria-label="Toggle comments"
        >
          <MessageCircle className="h-4 w-4 mr-1" />
          <span className="text-xs">{commentsCount}</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          className="text-gray-400 hover:text-green-500 transition-colors flex items-center"
          aria-label="Share post"
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleBookmarkToggle}
        className={`transition-colors flex items-center ${
          localIsBookmarked
            ? 'text-yellow-500 hover:text-yellow-400' 
            : 'text-gray-400 hover:text-yellow-500'
        }`}
        aria-pressed={localIsBookmarked}
        aria-label={localIsBookmarked ? "Remove bookmark" : "Add bookmark"}
      >
        <Bookmark className={`h-4 w-4 mr-1 ${localIsBookmarked ? 'fill-current' : ''}`} />
        <span className="text-xs">{bookmarksCount}</span>
      </Button>
    </div>
  );
};

export default PostEngagement;
