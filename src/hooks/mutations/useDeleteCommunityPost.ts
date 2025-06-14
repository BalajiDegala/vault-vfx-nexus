
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UploadedFile } from '@/types/community';

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

      // Delete attachments from your own storage API
      if (attachments && attachments.length > 0) {
        try {
          const response = await fetch('/api/files/delete', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
            },
            body: JSON.stringify({ 
              fileUrls: attachments.map(file => file.url),
              userId: user.id 
            })
          });

          if (!response.ok) {
            console.error('useDeleteCommunityPost: Error deleting attachments from storage');
            toast({ title: "Attachment Error", description: "Could not delete attachments, but post may be deleted.", variant: "destructive" });
          }
        } catch (error) {
          console.error('useDeleteCommunityPost: Error calling file deletion API:', error);
          toast({ title: "Attachment Error", description: "Could not delete attachments, but post may be deleted.", variant: "destructive" });
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
