
import logger from "@/lib/logger";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useCommentEngagement = () => {
  const { toast } = useToast();

  const addComment = async (postId: string, content: string) => {
    logger.log('useCommentEngagement: addComment called with postId:', postId, 'content:', content);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        logger.error('useCommentEngagement: Error getting user:', userError);
        toast({ title: "Authentication Error", description: "Could not verify user. Please log in.", variant: "destructive" });
        return false;
      }
      if (!user) {
        logger.warn('useCommentEngagement: User not authenticated. Cannot add comment.');
        toast({ title: "Authentication Error", description: "You must be logged in to comment.", variant: "destructive" });
        return false;
      }
      logger.log('useCommentEngagement: Authenticated user:', user.id, user.email);

      // First, ensure the user has a profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('id', user.id)
        .single();

      if (profileError) {
        logger.error('useCommentEngagement: Error fetching user profile:', profileError);
        
        // If profile doesn't exist, create one
        if (profileError.code === 'PGRST116') {
          logger.log('useCommentEngagement: Profile not found, creating one...');
          const { error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email || '',
              first_name: user.user_metadata?.first_name || '',
              last_name: user.user_metadata?.last_name || '',
              username: user.user_metadata?.username || ''
            });
          
          if (createError) {
            logger.error('useCommentEngagement: Error creating profile:', createError);
            toast({ title: "Profile Error", description: "Could not create user profile. Please try again.", variant: "destructive" });
            return false;
          }
          logger.log('useCommentEngagement: Profile created successfully');
        } else {
          toast({ title: "Profile Error", description: "Could not access user profile. Please try again.", variant: "destructive" });
          return false;
        }
      } else {
        logger.log('useCommentEngagement: User profile found:', profile);
      }

      const { error: insertError } = await supabase
        .from('community_post_comments')
        .insert({
          post_id: postId,
          author_id: user.id,
          content: content.trim()
        });

      if (insertError) {
        logger.error('useCommentEngagement: Error inserting comment into Supabase:', insertError);
        toast({
          title: "Error",
          description: `Failed to add comment: ${insertError.message}`,
          variant: "destructive",
        });
        return false;
      }
      
      logger.log('useCommentEngagement: Comment added successfully to Supabase for post:', postId);
      toast({
        title: "Success",
        description: "Comment added successfully!",
      });
      // Don't call refreshPosts() here to prevent conflicts with local comment loading
      return true;
    } catch (error) {
      logger.error('useCommentEngagement: Catch block error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  return { addComment };
};
