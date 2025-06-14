
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useCommunityPostsRealtime = (refreshPosts: () => Promise<void>) => {
  useEffect(() => {
    // Subscribe to real-time updates - create a single channel
    const channel = supabase
      .channel('community_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_posts' }, () => {
        console.log('Community posts updated, refreshing...');
        refreshPosts();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_post_likes' }, () => {
        console.log('Post likes updated, refreshing...');
        refreshPosts();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_post_comments' }, () => {
        console.log('Post comments updated, refreshing...');
        refreshPosts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshPosts]);
};
