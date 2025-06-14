
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { extractHashtags, updateTrendingHashtags } from '@/utils/hashtagUtils';
import { UploadedFile } from '@/types/community';

export const useCreateCommunityPost = (refreshPosts: () => Promise<void>) => {
  const { toast } = useToast();

  const createPost = async (content: string, category: string = 'general', attachments?: UploadedFile[]) => {
    try {
      console.log('useCreateCommunityPost: Creating new post with content:', content, 'category:', category, 'attachments:', attachments);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('useCreateCommunityPost: User not authenticated for createPost.');
        toast({ title: "Authentication Error", description: "You must be logged in to create posts.", variant: "destructive" });
        throw new Error('Not authenticated');
      }
      console.log('useCreateCommunityPost: Authenticated user for createPost:', user.id);

      const hashtags = extractHashtags(content);
      const attachmentsJson = attachments ? JSON.stringify(attachments) : '[]';
      console.log('useCreateCommunityPost: Attachments JSON for DB:', attachmentsJson);

      const { error } = await supabase
        .from('community_posts')
        .insert({
          author_id: user.id,
          content: content.trim(),
          category: category,
          attachments: attachmentsJson as any // Cast as any due to Supabase type complexities with JSONB
        });

      if (error) {
        console.error('useCreateCommunityPost: Error creating post in Supabase:', error);
        throw error;
      }
      
      if (hashtags.length > 0) {
        await updateTrendingHashtags(hashtags);
      }
      
      console.log('useCreateCommunityPost: Post created successfully.');
      toast({
        title: "Success",
        description: "Post created successfully!",
      });
      
      await refreshPosts();
      return true;
    } catch (error) {
      console.error('useCreateCommunityPost: Catch block error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
      return false;
    }
  };

  return { createPost };
};
