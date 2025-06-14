import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { extractHashtags, updateTrendingHashtags } from '@/utils/hashtagUtils';
import { UploadedFile } from '@/types/community'; // Ensure UploadedFile is imported from types

// Define BUCKET_NAME at the top for clarity
const BUCKET_NAME = 'community-attachments';


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

  const editPost = async (
    postId: string,
    content: string,
    category: string = 'general',
    newAttachments?: UploadedFile[],
    oldAttachments?: UploadedFile[]
  ) => {
    try {
      console.log('Editing post:', postId);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Determine attachments to delete from storage
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
      } else if (oldAttachments && (!newAttachments || newAttachments.length === 0)) { // All old attachments removed or newAttachments is empty
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
        console.log('Deleting attachments from storage:', filesToDelete);
        const { error: deleteError } = await supabase.storage.from(BUCKET_NAME).remove(filesToDelete);
        if (deleteError) {
          console.error('Error deleting attachments from storage:', deleteError);
          // Continue even if deletion fails, but log it.
        }
      }

      const hashtags = extractHashtags(content);
      const attachmentsJson = newAttachments ? JSON.stringify(newAttachments) : '[]';

      const { error } = await supabase
        .from('community_posts')
        .update({
          content: content.trim(),
          category: category,
          attachments: attachmentsJson as any,
          updated_at: new Date().toISOString(),
        })
        .eq('id', postId)
        .eq('author_id', user.id); // Ensure only author can edit

      if (error) {
        console.error('Error editing post:', error);
        throw error;
      }

      if (hashtags.length > 0) {
        // Consider if hashtag logic needs to account for removed/changed hashtags too
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
      console.error('Error editing post:', error);
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

      // Delete attachments from storage first
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
            // Proceed with post deletion even if storage deletion fails, but log error
          }
        }
      }

      const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', postId)
        .eq('author_id', user.id); // Ensure only author can delete

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

  const toggleLike = async (postId: string) => {
    try {
      console.log('Toggling like for post:', postId);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if already liked
      const { data: existingLike, error: checkError } = await supabase
        .from('community_post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle(); // Use maybeSingle to handle no existing like

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116: " esattamente una riga attesa, ma nessuna restituita" (exactly one row expected, but none returned) - specific error code for no rows with .single()
         // For other errors, throw them
        throw checkError;
      }


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
      
      if (checkError && checkError.code !== 'PGRST116') { // Ignore 'no rows' error for maybeSingle
        throw checkError;
      }

      if (existingBookmark) {
        // Unbookmark
        const { error: deleteError } = await supabase
          .from('community_post_bookmarks')
          .delete()
          .eq('id', existingBookmark.id); // Delete by bookmark ID for safety
        
        if (deleteError) throw deleteError;
        console.log('Post unbookmarked');
        toast({ title: "Success", description: "Post removed from bookmarks." });
      } else {
        // Bookmark
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
    createPost,
    toggleLike,
    addComment,
    editPost,
    deletePost,
    toggleBookmark // Expose the new function
  };
};
