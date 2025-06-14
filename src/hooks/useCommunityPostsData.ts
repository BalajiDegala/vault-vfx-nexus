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
      console.log('Fetching community posts...');
      
      const { data: { user } } = await supabase.auth.getUser();

      const { data: postsData, error: postsError } = await supabase
        .from('community_posts')
        .select(`
          *,
          author_profile:profiles!author_id (
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
      
      let bookmarkedPostIds = new Set<string>();
      if (user && postsData) {
        const { data: bookmarksData, error: bookmarksError } = await supabase
          .from('community_post_bookmarks')
          .select('post_id')
          .eq('user_id', user.id);

        if (bookmarksError) {
          console.error('Error fetching user bookmarks:', bookmarksError);
          // Continue without bookmark status if this fails
        } else if (bookmarksData) {
          bookmarksData.forEach(b => bookmarkedPostIds.add(b.post_id));
        }
      }
      
      console.log('Fetched posts:', postsData);
      
      const formattedPosts: CommunityPost[] = postsData?.map(post => ({
        ...post,
        attachments: post.attachments ? 
          (Array.isArray(post.attachments) ? post.attachments : JSON.parse(post.attachments as string)) as UploadedFile[] 
          : [],
        is_bookmarked: user ? bookmarkedPostIds.has(post.id) : false,
        // Ensure bookmarks_count is a number, defaulting to 0 if null/undefined
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
      console.log('Fetching comments for post:', postId);
      
      const { data, error } = await supabase
        .from('community_post_comments')
        .select(`
          *,
          author_profile:profiles!author_id (
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
      
      console.log('Fetched comments:', data);
      return data || [];
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
