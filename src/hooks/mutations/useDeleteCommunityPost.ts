
import logger from "@/lib/logger";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UploadedFile } from '@/types/community';
import { deleteFileFromServer } from '@/utils/fileServer';

export const useDeleteCommunityPost = (refreshPosts: () => Promise<void>) => {
  const { toast } = useToast();

  const deletePost = async (postId: string, attachments?: UploadedFile[]) => {
    try {
      logger.log('useDeleteCommunityPost: Deleting post:', postId);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        logger.warn('useDeleteCommunityPost: User not authenticated for deletePost.');
        toast({ title: "Authentication Error", description: "You must be logged in to delete posts.", variant: "destructive" });
        throw new Error('Not authenticated');
      }
      logger.log('useDeleteCommunityPost: Authenticated user for deletePost:', user.id);

      // Delete attachments from mock file server
      if (attachments && attachments.length > 0) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.access_token) {
            await deleteFileFromServer(
              attachments.map(file => file.url),
              user.id,
              session.access_token
            );
          }
        } catch (error) {
          logger.error('useDeleteCommunityPost: Error calling file deletion API:', error);
          toast({ title: "Attachment Error", description: "Could not delete attachments, but post may be deleted.", variant: "destructive" });
        }
      }

      const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', postId)
        .eq('author_id', user.id);

      if (error) {
        logger.error('useDeleteCommunityPost: Error deleting post:', error);
        throw error;
      }

      logger.log('useDeleteCommunityPost: Post deleted successfully');
      toast({
        title: "Success",
        description: "Post deleted successfully!",
      });

      await refreshPosts();
      return true;
    } catch (error) {
      logger.error('useDeleteCommunityPost: Error deleting post:', error);
      toast({
        title: "Error",
        description: "Failed to delete post.",
        variant: "destructive",
      });
      return false;
    }
  };

  return { deletePost };
};
