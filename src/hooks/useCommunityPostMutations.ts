import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { extractHashtags, updateTrendingHashtags } from '@/utils/hashtagUtils';
import { UploadedFile } from '@/types/community';

const BUCKET_NAME = 'community-attachments';

export const useCommunityPostMutations = (refreshPosts: () => Promise<void>) => {
  const { toast } = useToast();

  const createPost = async (content: string, category: string = 'general', attachments?: UploadedFile[]) => {
    try {
      console.log('useCommunityPostMutations: Creating new post with content:', content, 'category:', category, 'attachments:', attachments);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('useCommunityPostMutations: User not authenticated for createPost.');
        throw new Error('Not authenticated');
      }
      console.log('useCommunityPostMutations: Authenticated user for createPost:', user.id);

      const hashtags = extractHashtags(content);
      const attachmentsJson = attachments ? JSON.stringify(attachments) : '[]';
      console.log('useCommunityPostMutations: Attachments JSON for DB:', attachmentsJson);

      const { error } = await supabase
        .from('community_posts')
        .insert({
          author_id: user.id,
          content: content.trim(),
          category: category,
          attachments: attachmentsJson as any // Cast as any due to Supabase type complexities with JSONB
        });

      if (error) {
        console.error('useCommunityPostMutations: Error creating post in Supabase:', error);
        throw error;
      }
      
      if (hashtags.length > 0) {
        await updateTrendingHashtags(hashtags);
      }
      
      console.log('useCommunityPostMutations: Post created successfully.');
      toast({
        title: "Success",
        description: "Post created successfully!",
      });
      
      await refreshPosts();
      return true;
    } catch (error) {
      console.error('useCommunityPostMutations: Catch block error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
      return false;
    }
  };

  const editPost = async (
    postId: string,
    content: string,
    category: string = 'general',
    newAttachments?: UploadedFile[],
    oldAttachments?: UploadedFile[]
  ) => {
    try {
      console.log('useCommunityPostMutations: Editing post:', postId, 'with content:', content, 'category:', category, 'newAttachments:', newAttachments, 'oldAttachments:', oldAttachments);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('useCommunityPostMutations: User not authenticated for editPost.');
        throw new Error('Not authenticated');
      }
      console.log('useCommunityPostMutations: Authenticated user for editPost:', user.id);
      
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
              console.error("Error parsing attachment URL for deletion:", oldFile.url, e);
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
              console.error("Error parsing attachment URL for deletion:", oldFile.url, e);
            }
          });
      }

      if (filesToDelete.length > 0) {
        console.log('useCommunityPostMutations: Deleting attachments from storage:', filesToDelete);
        const { error: deleteError } = await supabase.storage.from(BUCKET_NAME).remove(filesToDelete);
        if (deleteError) {
          console.error('useCommunityPostMutations: Error deleting attachments from storage:', deleteError);
          // Potentially do not throw here, allow post update to proceed
        }
      }

      const hashtags = extractHashtags(content);
      const attachmentsJson = newAttachments ? JSON.stringify(newAttachments) : '[]';
      console.log('useCommunityPostMutations: Attachments JSON for DB update:', attachmentsJson);

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
        console.error('useCommunityPostMutations: Error editing post in Supabase:', error);
        throw error;
      }

      if (hashtags.length > 0) {
        await updateTrendingHashtags(hashtags);
      }

      console.log('Post edited successfully');
      toast({
        title: "Success",
        description: "Post updated successfully!",
      });

      await refreshPosts();
      return true;
    } catch (error) {
      console.error('useCommunityPostMutations: Catch block error editing post:', error);
      toast({
        title: "Error",
        description: "Failed to update post.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deletePost = async (postId: string, attachments?: UploadedFile[]) => {
    try {
      console.log('Deleting post:', postId);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (attachments && attachments.length > 0) {
        const filePaths = attachments.map(file => {
           try {
            const urlPath = new URL(file.url).pathname;
            return urlPath.substring(urlPath.indexOf(`/${BUCKET_NAME}/`) + `/${BUCKET_NAME}/`.length);
          } catch (e) {
            console.error("Error parsing attachment URL for deletion:", file.url, e);
            return null;
          }
        }).filter(path => path !== null) as string[];

        if (filePaths.length > 0) {
          console.log('Deleting attachments from storage:', filePaths);
          const { error: deleteError } = await supabase.storage.from(BUCKET_NAME).remove(filePaths);
          if (deleteError) {
            console.error('Error deleting attachments from storage:', deleteError);
          }
        }
      }

      const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', postId)
        .eq('author_id', user.id);

      if (error) {
        console.error('Error deleting post:', error);
        throw error;
      }

      console.log('Post deleted successfully');
      toast({
        title: "Success",
        description: "Post deleted successfully!",
      });

      await refreshPosts();
      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "Failed to delete post.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    createPost,
    editPost,
    deletePost,
  };
};
