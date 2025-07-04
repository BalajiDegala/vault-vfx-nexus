
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useCommunityPostsRealtime = (refreshPosts: () => Promise<void>) => {
  const channelRef = useRef<any>(null);

  useEffect(() => {
    // Clean up any existing channel first
    if (channelRef.current) {
      console.log('Cleaning up existing community channel');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Create a unique channel name to avoid conflicts
    const channelName = `community_updates_${Date.now()}`;
    
    // Subscribe to real-time updates - create a single channel
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'community_posts' 
      }, async () => {
        try {
          console.log('Community posts updated, refreshing...');
          await refreshPosts();
        } catch (error) {
          console.error('Error refreshing posts:', error);
        }
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'community_post_likes' 
      }, async () => {
        try {
          console.log('Post likes updated, refreshing...');
          await refreshPosts();
        } catch (error) {
          console.error('Error refreshing posts after like:', error);
        }
      })
      .subscribe((status: string) => {
        console.log('Community realtime subscription status:', status);
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        console.log('Cleaning up community realtime subscription');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [refreshPosts]);
};
