
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { extractHashtags, updateTrendingHashtags } from '@/utils/hashtagUtils';

interface UploadedFile {
  name: string;
  url: string;
  type: string;
  size: number;
}

export const useCommunityPostActions = (refreshPosts: () => Promise<void>) => {
  const { toast } = useToast();

  const createPost = async (content: string, category: string = 'general', attachments?: UploadedFile[]) => {
    try {
      console.log('Creating new post...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Extract hashtags from content
      const hashtags = extractHashtags(content);

      // Convert attachments to Json format for database storage
      const attachmentsJson = attachments ? JSON.stringify(attachments) : '[]';

      const { error } = await supabase
        .from('community_posts')
        .insert({
          author_id: user.id,
          content: content.trim(),
          category: category,
          attachments: attachmentsJson as any
        });

      if (error) {
        console.error('Error creating post:', error);
        throw error;
      }
      
      // Update trending hashtags
      if (hashtags.length > 0) {
        await updateTrendingHashtags(hashtags);
      }
      
      console.log('Post created successfully');
      toast({
        title: "Success",
        description: "Post created successfully!",
      });
      
      await refreshPosts(); // Refresh posts after creating
      return true;
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
      return false;
    }
  };

  const toggleLike = async (postId: string) => {
    try {
      console.log('Toggling like for post:', postId);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if already liked
      const { data: existingLike } = await supabase
        .from('community_post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        // Unlike
        const { error } = await supabase
          .from('community_post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
        
        if (error) throw error;
        console.log('Post unliked');
      } else {
        // Like
        const { error } = await supabase
          .from('community_post_likes')
          .insert({
            post_id: postId,
            user_id: user.id
          });
        
        if (error) throw error;
        console.log('Post liked');
      }
      
      await refreshPosts(); // Refresh posts after like/unlike
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive",
      });
    }
  };

  const addComment = async (postId: string, content: string) => {
    try {
      console.log('Adding comment to post:', postId);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('community_post_comments')
        .insert({
          post_id: postId,
          author_id: user.id,
          content: content.trim()
        });

      if (error) {
        console.error('Error adding comment:', error);
        throw error;
      }
      
      console.log('Comment added successfully');
      await refreshPosts(); // Refresh posts to update comment count
      return true;
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    createPost,
    toggleLike,
    addComment
  };
};
