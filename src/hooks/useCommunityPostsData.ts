
import logger from "@/lib/logger";
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CommunityPost, Comment, UploadedFile } from '@/types/community';

export const useCommunityPostsData = () => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchPosts = async () => {
    try {
      setLoading(true);
      logger.log('Fetching community posts...');
      
      const { data: { user } } = await supabase.auth.getUser();

      const { data: postsData, error: postsError } = await supabase
        .from('community_posts')
        .select(`
          *,
          profiles!community_posts_author_id_fkey (
            first_name,
            last_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error('Error fetching posts:', postsError);
        throw postsError;
      }
      
      const bookmarkedPostIds = new Set<string>();
      const likedPostIds = new Set<string>(); // For tracking liked posts

      if (user && postsData) {
        // Fetch bookmarks
        const { data: bookmarksData, error: bookmarksError } = await supabase
          .from('community_post_bookmarks')
          .select('post_id')
          .eq('user_id', user.id);

        if (bookmarksError) {
          console.error('Error fetching user bookmarks:', bookmarksError);
        } else if (bookmarksData) {
          bookmarksData.forEach(b => bookmarkedPostIds.add(b.post_id));
        }

        // Fetch likes
        const { data: likesData, error: likesError } = await supabase
          .from('community_post_likes')
          .select('post_id')
          .eq('user_id', user.id);

        if (likesError) {
          console.error('Error fetching user likes:', likesError);
        } else if (likesData) {
          likesData.forEach(l => likedPostIds.add(l.post_id));
        }
      }
      
      logger.log('Fetched posts:', postsData);
      
      const formattedPosts: CommunityPost[] = postsData
        ?.filter(post => post.profiles) // Only include posts with valid profile data
        ?.map(post => ({
          ...post,
          author_profile: {
            first_name: post.profiles?.first_name || '',
            last_name: post.profiles?.last_name || '',
            avatar_url: post.profiles?.avatar_url || ''
          },
          attachments: post.attachments ? 
            (Array.isArray(post.attachments) ? post.attachments : JSON.parse(post.attachments as string)) as UploadedFile[] 
            : [],
          is_bookmarked: user ? bookmarkedPostIds.has(post.id) : false,
          is_liked: user ? likedPostIds.has(post.id) : false, // Add is_liked status
          bookmarks_count: typeof post.bookmarks_count === 'number' ? post.bookmarks_count : 0,
        })) || [];
      
      setPosts(formattedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to load community posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (postId: string): Promise<Comment[]> => {
    try {
      logger.log('Fetching comments for post:', postId);
      
      const { data, error } = await supabase
        .from('community_post_comments')
        .select(`
          *,
          profiles!community_post_comments_author_id_fkey (
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching comments:', error);
        throw error;
      }
      
      logger.log('Fetched comments:', data);
      
      const formattedComments = (data || [])
        .filter(comment => comment.profiles) // Only include comments with valid profile data
        .map(comment => ({
          ...comment,
          author_profile: {
            first_name: comment.profiles?.first_name || '',
            last_name: comment.profiles?.last_name || '',
            avatar_url: comment.profiles?.avatar_url || ''
          }
        }));
      
      return formattedComments;
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  };

  return {
    posts,
    loading,
    fetchPosts,
    fetchComments,
    setPosts
  };
};
