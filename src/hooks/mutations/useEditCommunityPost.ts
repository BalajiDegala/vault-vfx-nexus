
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { extractHashtags, updateTrendingHashtags } from '@/utils/hashtagUtils';
import { UploadedFile } from '@/types/community';

const BUCKET_NAME = 'community-attachments';

export const useEditCommunityPost = (refreshPosts: () => Promise<void>) => {
  const { toast } = useToast();

  const editPost = async (
    postId: string,
    content: string,
    category: string = 'general',
    newAttachments?: UploadedFile[],
    oldAttachments?: UploadedFile[]
  ) => {
    try {
      console.log('useEditCommunityPost: Editing post:', postId, 'with content:', content, 'category:', category, 'newAttachments:', newAttachments, 'oldAttachments:', oldAttachments);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('useEditCommunityPost: User not authenticated for editPost.');
        toast({ title: "Authentication Error", description: "You must be logged in to edit posts.", variant: "destructive" });
        throw new Error('Not authenticated');
      }
      console.log('useEditCommunityPost: Authenticated user for editPost:', user.id);
      
      const filesToDelete: string[] = [];
      if (oldAttachments && newAttachments) {
        const newAttachmentUrls = new Set(newAttachments.map(file => file.url));
        oldAttachments.forEach(oldFile => {
          if (!newAttachmentUrls.has(oldFile.url)) {
            try {
              const urlPath = new URL(oldFile.url).pathname;
              const filePath = urlPath.substring(urlPath.indexOf(`/${BUCKET_NAME}/`) + `/${BUCKET_NAME}/`.length);
              if (filePath) filesToDelete.push(filePath);
            } catch (e) {
              console.error("useEditCommunityPost: Error parsing attachment URL for deletion:", oldFile.url, e);
            }
          }
        });
      } else if (oldAttachments && (!newAttachments || newAttachments.length === 0)) {
         oldAttachments.forEach(oldFile => {
            try {
              const urlPath = new URL(oldFile.url).pathname;
              const filePath = urlPath.substring(urlPath.indexOf(`/${BUCKET_NAME}/`) + `/${BUCKET_NAME}/`.length);
              if (filePath) filesToDelete.push(filePath);
            } catch (e) {
              console.error("useEditCommunityPost: Error parsing attachment URL for deletion:", oldFile.url, e);
            }
          });
      }

      if (filesToDelete.length > 0) {
        console.log('useEditCommunityPost: Deleting attachments from storage:', filesToDelete);
        const { error: deleteError } = await supabase.storage.from(BUCKET_NAME).remove(filesToDelete);
        if (deleteError) {
          console.error('useEditCommunityPost: Error deleting attachments from storage:', deleteError);
          // Potentially do not throw here, allow post update to proceed
          toast({ title: "Attachment Error", description: "Could not delete old attachments, but post may be updated.", variant: "warning" });
        }
      }

      const hashtags = extractHashtags(content);
      const attachmentsJson = newAttachments ? JSON.stringify(newAttachments) : '[]';
      console.log('useEditCommunityPost: Attachments JSON for DB update:', attachmentsJson);

      const { error } = await supabase
        .from('community_posts')
        .update({
          content: content.trim(),
          category: category,
          attachments: attachmentsJson as any, // Cast as any
          updated_at: new Date().toISOString(),
        })
        .eq('id', postId)
        .eq('author_id', user.id);

      if (error) {
        console.error('useEditCommunityPost: Error editing post in Supabase:', error);
        throw error;
      }

      if (hashtags.length > 0) {
        await updateTrendingHashtags(hashtags);
      }

      console.log('useEditCommunityPost: Post edited successfully');
      toast({
        title: "Success",
        description: "Post updated successfully!",
      });

      await refreshPosts();
      return true;
    } catch (error) {
      console.error('useEditCommunityPost: Catch block error editing post:', error);
      toast({
        title: "Error",
        description: "Failed to update post.",
        variant: "destructive",
      });
      return false;
    }
  };

  return { editPost };
};
