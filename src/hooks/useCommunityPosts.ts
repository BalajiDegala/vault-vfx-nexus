import { useEffect } from 'react';
import { useCommunityPostsData } from './useCommunityPostsData';
import { useCommunityPostActions } from './useCommunityPostActions';
import { useCommunityPostsRealtime } from './useCommunityPostsRealtime';

export const useCommunityPosts = () => {
  const { posts, loading, fetchPosts, fetchComments, setPosts } = useCommunityPostsData();
  const { createPost, toggleLike, addComment, editPost, deletePost, toggleBookmark } = useCommunityPostActions(fetchPosts); // Added toggleBookmark
  
  useCommunityPostsRealtime(fetchPosts);

  useEffect(() => {
    fetchPosts();
  }, []); // Removed fetchPosts from dependencies to avoid re-fetching on every action

  return {
    posts,
    loading,
    createPost,
    toggleLike,
    fetchComments,
    addComment,
    editPost, 
    deletePost,
    toggleBookmark, // Expose toggleBookmark
    refreshPosts: fetchPosts,
    setPosts 
  };
};
