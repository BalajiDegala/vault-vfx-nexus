
import { useEffect } from 'react';
import { useCommunityPostsData } from './useCommunityPostsData';
import { useCommunityPostMutations } from './useCommunityPostMutations';
import { useCommunityPostEngagement } from './useCommunityPostEngagement';
import { useCommunityPostsRealtime } from './useCommunityPostsRealtime';

export const useCommunityPosts = () => {
  const { posts, loading, fetchPosts, fetchComments, setPosts } = useCommunityPostsData();
  const { createPost, editPost, deletePost } = useCommunityPostMutations(fetchPosts);
  const { toggleLike, addComment, toggleBookmark } = useCommunityPostEngagement(fetchPosts);
  
  useCommunityPostsRealtime(fetchPosts);

  useEffect(() => {
    fetchPosts();
  }, []);

  return {
    posts,
    loading,
    createPost,
    editPost, 
    deletePost,
    toggleLike,
    addComment,
    toggleBookmark,
    fetchComments,
    refreshPosts: fetchPosts,
    setPosts 
  };
};
