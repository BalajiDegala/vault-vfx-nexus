
import { useEffect } from 'react';
import { useCommunityPostsData } from './useCommunityPostsData';
import { useCommunityPostActions } from './useCommunityPostActions';
import { useCommunityPostsRealtime } from './useCommunityPostsRealtime';

export const useCommunityPosts = () => {
  const { posts, loading, fetchPosts, fetchComments } = useCommunityPostsData();
  const { createPost, toggleLike, addComment } = useCommunityPostActions(fetchPosts);
  
  // Set up real-time subscriptions
  useCommunityPostsRealtime(fetchPosts);

  useEffect(() => {
    fetchPosts();
  }, []);

  return {
    posts,
    loading,
    createPost,
    toggleLike,
    fetchComments,
    addComment,
    refreshPosts: fetchPosts
  };
};
