
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
      
      const { data, error } = await supabase
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

      if (error) {
        console.error('Error fetching posts:', error);
        throw error;
      }
      
      console.log('Fetched posts:', data);
      
      // Convert the data to match our CommunityPost interface
      const formattedPosts: CommunityPost[] = data?.map(post => ({
        ...post,
        attachments: post.attachments ? 
          (Array.isArray(post.attachments) ? post.attachments : JSON.parse(post.attachments as string)) as UploadedFile[] 
          : []
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
