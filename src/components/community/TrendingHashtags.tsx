
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import logger from "@/lib/logger";

interface TrendingHashtag {
  hashtag: string;
  post_count: number;
}

interface TrendingHashtagsProps {
  onHashtagClick: (hashtag: string) => void;
}

const TrendingHashtags = ({ onHashtagClick }: TrendingHashtagsProps) => {
  const [hashtags, setHashtags] = useState<TrendingHashtag[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrendingHashtags = async () => {
    try {
      const { data, error } = await supabase
        .from('trending_hashtags')
        .select('hashtag, post_count')
        .order('post_count', { ascending: false })
        .limit(10);

      if (error) throw error;
      setHashtags(data || []);
    } catch (error) {
      logger.error('Error fetching trending hashtags:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendingHashtags();
  }, []);

  if (loading) {
    return (
      <Card className="bg-gray-900/80 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Trending Hashtags
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-6 bg-gray-700 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900/80 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Trending Hashtags
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {hashtags.length === 0 ? (
            <p className="text-gray-400 text-sm">No trending hashtags yet</p>
          ) : (
            hashtags.map((tag, index) => (
              <div key={tag.hashtag} className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-blue-500/20 text-blue-400 border-blue-500/30"
                  onClick={() => onHashtagClick(tag.hashtag)}
                >
                  #{tag.hashtag}
                </Badge>
                <span className="text-gray-400 text-xs">{tag.post_count} posts</span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TrendingHashtags;
