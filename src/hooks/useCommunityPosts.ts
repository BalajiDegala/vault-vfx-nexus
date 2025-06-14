
import { useEffect } from 'react';
import { useCommunityPostsData } from './useCommunityPostsData';
import { useCommunityPostActions } from './useCommunityPostActions';
import { useCommunityPostsRealtime } from './useCommunityPostsRealtime';

export const useCommunityPosts = () => {
  const { posts, loading, fetchPosts, fetchComments, setPosts } = useCommunityPostsData(); // Added setPosts
  const { createPost, toggleLike, addComment, editPost, deletePost } = useCommunityPostActions(fetchPosts);
  
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
    editPost, 
    deletePost,
    refreshPosts: fetchPosts,
    setPosts // expose setPosts if needed by realtime updates directly modifying posts
  };
};

