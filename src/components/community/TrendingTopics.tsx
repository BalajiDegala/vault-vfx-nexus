
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Hash, MessageCircle, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TrendingTopic {
  hashtag: string;
  post_count: number;
  user_count: number;
}

interface TrendingPost {
  id: string;
  content: string;
  likes_count: number;
  comments_count: number;
  author_profile: {
    first_name: string;
    last_name: string;
  };
  created_at: string;
}

const TrendingTopics = () => {
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<TrendingPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrendingData = async () => {
    try {
      setLoading(true);
      
      // Fetch trending hashtags
      const { data: hashtagsData } = await supabase
        .from('trending_hashtags')
        .select('*')
        .order('post_count', { ascending: false })
        .limit(10);

      if (hashtagsData) {
        setTrendingTopics(hashtagsData.map(item => ({
          hashtag: item.hashtag || '',
          post_count: Number(item.post_count) || 0,
          user_count: Number(item.user_count) || 0
        })));
      }

      // Fetch trending posts (posts with high engagement)
      const { data: postsData } = await supabase
        .from('community_posts')
        .select(`
          id,
          content,
          likes_count,
          comments_count,
          created_at,
          author_profile:profiles!author_id (
            first_name,
            last_name
          )
        `)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
        .order('likes_count', { ascending: false })
        .limit(5);

      if (postsData) {
        setTrendingPosts(postsData);
      }
      
    } catch (error) {
      console.error('Error fetching trending data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendingData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center text-gray-400 py-8">
          <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Loading trending topics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-4">
          <TrendingUp className="h-6 w-6" />
          Trending in VFX Community
        </h2>
        <p className="text-gray-400">Discover what's hot in the VFX community right now</p>
      </div>

      {/* Trending Hashtags */}
      <Card className="bg-gray-900/80 border-blue-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Hash className="h-5 w-5" />
            Trending Hashtags
          </CardTitle>
        </CardHeader>
        <CardContent>
          {trendingTopics.length === 0 ? (
            <div className="text-center text-gray-400 py-6">
              <Hash className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No trending hashtags yet</p>
              <p className="text-sm">Start using hashtags in your posts to see trends!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trendingTopics.map((topic, index) => (
                <div key={topic.hashtag} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-blue-400 border-blue-400">
                      #{index + 1}
                    </Badge>
                    <span className="text-white font-medium">#{topic.hashtag}</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    {topic.post_count} posts • {topic.user_count} users
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trending Posts */}
      <Card className="bg-gray-900/80 border-blue-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Most Engaged Posts This Week
          </CardTitle>
        </CardHeader>
        <CardContent>
          {trendingPosts.length === 0 ? (
            <div className="text-center text-gray-400 py-6">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No trending posts this week</p>
              <p className="text-sm">Create engaging content to appear here!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {trendingPosts.map((post, index) => {
                const authorName = `${post.author_profile?.first_name || ''} ${post.author_profile?.last_name || ''}`.trim() || 'Anonymous';
                
                return (
                  <div key={post.id} className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-orange-500/20 text-orange-400">
                          #{index + 1}
                        </Badge>
                        <span className="text-white font-medium">{authorName}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {post.likes_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {post.comments_count}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-200 text-sm line-clamp-3">{post.content}</p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Community Stats */}
      <Card className="bg-gray-900/80 border-blue-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5" />
            Community Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">{trendingTopics.reduce((sum, topic) => sum + topic.post_count, 0)}</div>
              <div className="text-sm text-gray-400">Total Posts</div>
            </div>
            <div className="text-center p-4 bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-green-400">{trendingTopics.reduce((sum, topic) => sum + topic.user_count, 0)}</div>
              <div className="text-sm text-gray-400">Active Users</div>
            </div>
            <div className="text-center p-4 bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-purple-400">{trendingTopics.length}</div>
              <div className="text-sm text-gray-400">Trending Topics</div>
            </div>
            <div className="text-center p-4 bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-orange-400">{trendingPosts.reduce((sum, post) => sum + post.likes_count + post.comments_count, 0)}</div>
              <div className="text-sm text-gray-400">Engagements</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrendingTopics;
