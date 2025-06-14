
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UploadedFile } from '@/types/community';

const BUCKET_NAME = 'community-attachments';

export const useDeleteCommunityPost = (refreshPosts: () => Promise<void>) => {
  const { toast } = useToast();

  const deletePost = async (postId: string, attachments?: UploadedFile[]) => {
    try {
      console.log('useDeleteCommunityPost: Deleting post:', postId);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('useDeleteCommunityPost: User not authenticated for deletePost.');
        toast({ title: "Authentication Error", description: "You must be logged in to delete posts.", variant: "destructive" });
        throw new Error('Not authenticated');
      }
      console.log('useDeleteCommunityPost: Authenticated user for deletePost:', user.id);


      if (attachments && attachments.length > 0) {
        const filePaths = attachments.map(file => {
           try {
            const urlPath = new URL(file.url).pathname;
            // Ensure the path starts correctly after the bucket name
            const bucketPrefix = `/${BUCKET_NAME}/`;
            const startIndex = urlPath.indexOf(bucketPrefix);
            if (startIndex === -1) {
                console.error("useDeleteCommunityPost: Bucket name not found in URL path:", file.url);
                return null;
            }
            return urlPath.substring(startIndex + bucketPrefix.length);
          } catch (e) {
            console.error("useDeleteCommunityPost: Error parsing attachment URL for deletion:", file.url, e);
            return null;
          }
        }).filter(path => path !== null) as string[];

        if (filePaths.length > 0) {
          console.log('useDeleteCommunityPost: Deleting attachments from storage:', filePaths);
          const { error: deleteError } = await supabase.storage.from(BUCKET_NAME).remove(filePaths);
          if (deleteError) {
            console.error('useDeleteCommunityPost: Error deleting attachments from storage:', deleteError);
            // Potentially do not throw here, allow post deletion to proceed
            toast({ title: "Attachment Error", description: "Could not delete attachments, but post may be deleted.", variant: "warning" });
          }
        }
      }

      const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', postId)
        .eq('author_id', user.id);

      if (error) {
        console.error('useDeleteCommunityPost: Error deleting post:', error);
        throw error;
      }

      console.log('useDeleteCommunityPost: Post deleted successfully');
      toast({
        title: "Success",
        description: "Post deleted successfully!",
      });

      await refreshPosts();
      return true;
    } catch (error) {
      console.error('useDeleteCommunityPost: Error deleting post:', error);
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
