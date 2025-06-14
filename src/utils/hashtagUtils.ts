
import { supabase } from '@/integrations/supabase/client';

export const extractHashtags = (content: string): string[] => {
  const hashtagRegex = /#(\w+)/g;
  const matches = content.match(hashtagRegex);
  return matches ? matches.map(tag => tag.substring(1).toLowerCase()) : [];
};

export const updateTrendingHashtags = async (hashtags: string[]) => {
  if (hashtags.length === 0) return;

  try {
    for (const hashtag of hashtags) {
      const { error } = await supabase.rpc('update_hashtag_count', {
        hashtag_name: hashtag
      });
      
      if (error) {
        console.error('Error updating hashtag count:', error);
      }
    }
  } catch (error) {
    console.error('Error in updateTrendingHashtags:', error);
  }
};
