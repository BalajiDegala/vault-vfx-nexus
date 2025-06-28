
import logger from "@/lib/logger";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { extractHashtags, updateTrendingHashtags } from '@/utils/hashtagUtils';
import { UploadedFile } from '@/types/community';
import { deleteFileFromServer } from '@/utils/fileServer';

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
      logger.log('useEditCommunityPost: Editing post:', postId, 'with content:', content, 'category:', category, 'newAttachments:', newAttachments, 'oldAttachments:', oldAttachments);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        logger.warn('useEditCommunityPost: User not authenticated for editPost.');
        toast({ title: "Authentication Error", description: "You must be logged in to edit posts.", variant: "destructive" });
        throw new Error('Not authenticated');
      }
      logger.log('useEditCommunityPost: Authenticated user for editPost:', user.id);
      
      // Handle file deletions using mock file server
      const filesToDelete: string[] = [];
      if (oldAttachments && newAttachments) {
        const newAttachmentUrls = new Set(newAttachments.map(file => file.url));
        oldAttachments.forEach(oldFile => {
          if (!newAttachmentUrls.has(oldFile.url)) {
            filesToDelete.push(oldFile.url);
          }
        });
      } else if (oldAttachments && (!newAttachments || newAttachments.length === 0)) {
        oldAttachments.forEach(oldFile => {
          filesToDelete.push(oldFile.url);
        });
      }

      if (filesToDelete.length > 0) {
        logger.log('useEditCommunityPost: Deleting attachments from storage:', filesToDelete);
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.access_token) {
            await deleteFileFromServer(filesToDelete, user.id, session.access_token);
          }
        } catch (error) {
          logger.error('useEditCommunityPost: Error calling file deletion API:', error);
          toast({ title: "Attachment Error", description: "Could not delete old attachments, but post may be updated.", variant: "destructive" });
        }
      }

      const hashtags = extractHashtags(content);
      const attachmentsJson = newAttachments ? JSON.stringify(newAttachments) : '[]';
      logger.log('useEditCommunityPost: Attachments JSON for DB update:', attachmentsJson);

      const { error } = await supabase
        .from('community_posts')
        .update({
          content: content.trim(),
          category: category,
          attachments: attachmentsJson as any,
          updated_at: new Date().toISOString(),
        })
        .eq('id', postId)
        .eq('author_id', user.id);

      if (error) {
        logger.error('useEditCommunityPost: Error editing post in Supabase:', error);
        throw error;
      }

      if (hashtags.length > 0) {
        await updateTrendingHashtags(hashtags);
      }

      logger.log('useEditCommunityPost: Post edited successfully');
      toast({
        title: "Success",
        description: "Post updated successfully!",
      });

      await refreshPosts();
      return true;
    } catch (error) {
      logger.error('useEditCommunityPost: Catch block error editing post:', error);
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
