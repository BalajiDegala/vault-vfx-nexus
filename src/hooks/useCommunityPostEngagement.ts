
import { useLikeEngagement } from './engagement/useLikeEngagement';
import { useCommentEngagement } from './engagement/useCommentEngagement';
import { useBookmarkEngagement } from './engagement/useBookmarkEngagement';

export const useCommunityPostEngagement = (refreshPosts: () => Promise<void>) => {
  const { toggleLike } = useLikeEngagement(refreshPosts);
  const { addComment } = useCommentEngagement();
  const { toggleBookmark } = useBookmarkEngagement(refreshPosts);

  return {
    toggleLike,
    addComment,
    toggleBookmark,
  };
};
