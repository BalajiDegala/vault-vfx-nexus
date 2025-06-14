
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useCommunityPostEngagement = (refreshPosts: () => Promise<void>) => {
  const { toast } = useToast();

  const toggleLike = async (postId: string) => {
    try {
      console.log('Toggling like for post:', postId);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: existingLike, error: checkError } = await supabase
        .from('community_post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') { 
        throw checkError;
      }

      if (existingLike) {
        const { error } = await supabase
          .from('community_post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
        
        if (error) throw error;
        console.log('Post unliked');
      } else {
        const { error } = await supabase
          .from('community_post_likes')
          .insert({
            post_id: postId,
            user_id: user.id
          });
        
        if (error) throw error;
        console.log('Post liked');
      }
      
      await refreshPosts(); 
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
      await refreshPosts();
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

  const toggleBookmark = async (postId: string) => {
    try {
      console.log('Toggling bookmark for post:', postId);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Authentication Error", description: "You must be logged in to bookmark posts.", variant: "destructive" });
        throw new Error('Not authenticated');
      }

      const { data: existingBookmark, error: checkError } = await supabase
        .from('community_post_bookmarks')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingBookmark) {
        const { error: deleteError } = await supabase
          .from('community_post_bookmarks')
          .delete()
          .eq('id', existingBookmark.id);
        
        if (deleteError) throw deleteError;
        console.log('Post unbookmarked');
        toast({ title: "Success", description: "Post removed from bookmarks." });
      } else {
        const { error: insertError } = await supabase
          .from('community_post_bookmarks')
          .insert({
            post_id: postId,
            user_id: user.id
          });
        
        if (insertError) throw insertError;
        console.log('Post bookmarked');
        toast({ title: "Success", description: "Post added to bookmarks!" });
      }
      
      await refreshPosts();
      return true;
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast({
        title: "Error",
        description: "Failed to update bookmark.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    toggleLike,
    addComment,
    toggleBookmark,
  };
};
