
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useCommunityPostEngagement = (refreshPosts: () => Promise<void>) => {
  const { toast } = useToast();

  const toggleLike = async (postId: string) => {
    try {
      console.log('Toggling like for post:', postId);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Authentication Error", description: "You must be logged in to like posts.", variant: "destructive" });
        throw new Error('Not authenticated');
      }

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
    console.log('useCommunityPostEngagement: addComment called with postId:', postId, 'content:', content);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('useCommunityPostEngagement: Error getting user:', userError);
        toast({ title: "Authentication Error", description: "Could not verify user. Please log in.", variant: "destructive" });
        return false;
      }
      if (!user) {
        console.warn('useCommunityPostEngagement: User not authenticated. Cannot add comment.');
        toast({ title: "Authentication Error", description: "You must be logged in to comment.", variant: "destructive" });
        return false;
      }
      console.log('useCommunityPostEngagement: Authenticated user:', user.id, user.email);

      // First, ensure the user has a profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('useCommunityPostEngagement: Error fetching user profile:', profileError);
        
        // If profile doesn't exist, create one
        if (profileError.code === 'PGRST116') {
          console.log('useCommunityPostEngagement: Profile not found, creating one...');
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
            console.error('useCommunityPostEngagement: Error creating profile:', createError);
            toast({ title: "Profile Error", description: "Could not create user profile. Please try again.", variant: "destructive" });
            return false;
          }
          console.log('useCommunityPostEngagement: Profile created successfully');
        } else {
          toast({ title: "Profile Error", description: "Could not access user profile. Please try again.", variant: "destructive" });
          return false;
        }
      } else {
        console.log('useCommunityPostEngagement: User profile found:', profile);
      }

      const { error: insertError } = await supabase
        .from('community_post_comments')
        .insert({
          post_id: postId,
          author_id: user.id,
          content: content.trim()
        });

      if (insertError) {
        console.error('useCommunityPostEngagement: Error inserting comment into Supabase:', insertError);
        toast({
          title: "Error",
          description: `Failed to add comment: ${insertError.message}`,
          variant: "destructive",
        });
        return false;
      }
      
      console.log('useCommunityPostEngagement: Comment added successfully to Supabase for post:', postId);
      toast({
        title: "Success",
        description: "Comment added successfully!",
      });
      await refreshPosts();
      return true;
    } catch (error) {
      console.error('useCommunityPostEngagement: Catch block error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
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
