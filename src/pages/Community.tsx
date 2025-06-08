
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Send, TrendingUp, Users, Hash } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];
type CommunityPost = Database["public"]["Tables"]["community_posts"]["Row"] & {
  profiles: {
    username: string | null;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  } | null;
};

type TrendingHashtag = {
  hashtag: string;
  post_count: number;
  user_count: number;
};

const Community = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<TrendingHashtag[]>([]);
  const [newPost, setNewPost] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
    fetchPosts();
    fetchTrendingTopics();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/login");
        return;
      }

      setUser(session.user);

      const { data: rolesData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);

      if (roleError) {
        console.error("Role fetch error:", roleError);
        navigate("/login");
        return;
      }

      if (!rolesData || rolesData.length === 0) {
        navigate("/login");
        return;
      }

      const roles = rolesData.map(r => r.role);
      let selectedRole: AppRole = roles[0];

      if (roles.includes('admin')) selectedRole = 'admin';
      else if (roles.includes('producer')) selectedRole = 'producer';
      else if (roles.includes('studio')) selectedRole = 'studio';
      else if (roles.includes('artist')) selectedRole = 'artist';

      setUserRole(selectedRole);
    } catch (error) {
      console.error("Auth check error:", error);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("community_posts")
        .select(`
          *,
          profiles (
            username,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching posts:", error);
        return;
      }

      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const fetchTrendingTopics = async () => {
    try {
      const { data, error } = await supabase
        .from("trending_hashtags")
        .select("*");

      if (error) {
        console.error("Error fetching trending topics:", error);
        return;
      }

      setTrendingTopics(data || []);
    } catch (error) {
      console.error("Error fetching trending topics:", error);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim() || !user) return;

    setIsPosting(true);
    try {
      // Extract mentions
      const mentionPattern = /@(\w+)/g;
      const mentions = newPost.match(mentionPattern)?.map(m => m.slice(1)) || [];

      const { error } = await supabase
        .from("community_posts")
        .insert({
          author_id: user.id,
          content: newPost.trim(),
          mentioned_users: mentions
        });

      if (error) {
        console.error("Error creating post:", error);
        toast({
          title: "Error",
          description: "Failed to create post. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setNewPost("");
      fetchPosts();
      fetchTrendingTopics(); // Refresh trending topics
      toast({
        title: "Success",
        description: "Post created successfully!",
      });
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPosting(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!user) return;

    try {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from("community_post_likes")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .single();

      if (existingLike) {
        // Remove like
        await supabase
          .from("community_post_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);
      } else {
        // Add like
        await supabase
          .from("community_post_likes")
          .insert({
            post_id: postId,
            user_id: user.id
          });
      }

      fetchPosts(); // Refresh posts to update like counts
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const formatDisplayName = (profile: CommunityPost['profiles']) => {
    if (!profile) return "Unknown User";
    if (profile.username) return `@${profile.username}`;
    if (profile.first_name || profile.last_name) {
      return `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    }
    return "Unknown User";
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading community...</p>
        </div>
      </div>
    );
  }

  if (!user || !userRole) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      <DashboardNavbar user={user} userRole={userRole} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
                VFX Community
              </h1>
              <p className="text-gray-400">
                Connect, share, and collaborate with fellow VFX professionals
              </p>
            </div>

            {/* Create Post */}
            <Card className="bg-gray-900/80 border-blue-500/20 backdrop-blur-md">
              <CardContent className="p-6">
                <div className="flex space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      {user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-4">
                    <Textarea
                      placeholder="Share your thoughts, ask questions, or showcase your work... Use #hashtags and @mentions"
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 resize-none"
                      rows={3}
                    />
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-400">
                        {newPost.length}/500 characters
                      </p>
                      <Button 
                        onClick={handleCreatePost}
                        disabled={!newPost.trim() || isPosting}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {isPosting ? "Posting..." : "Post"}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Posts Feed */}
            <div className="space-y-6">
              {posts.map((post) => (
                <Card key={post.id} className="bg-gray-900/80 border-blue-500/20 backdrop-blur-md">
                  <CardContent className="p-6">
                    <div className="flex space-x-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={post.profiles?.avatar_url || ""} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                          {formatDisplayName(post.profiles).charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium text-white">
                            {formatDisplayName(post.profiles)}
                          </span>
                          <span className="text-gray-400 text-sm">
                            {formatTimeAgo(post.created_at)}
                          </span>
                        </div>
                        <p className="text-gray-300 mb-4 whitespace-pre-wrap">
                          {post.content}
                        </p>
                        <div className="flex items-center space-x-6">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLikePost(post.id)}
                            className="text-gray-400 hover:text-red-400 hover:bg-red-400/10"
                          >
                            <Heart className="h-4 w-4 mr-1" />
                            {post.likes_count}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-blue-400 hover:bg-blue-400/10"
                          >
                            <MessageCircle className="h-4 w-4 mr-1" />
                            {post.comments_count}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {posts.length === 0 && (
                <Card className="bg-gray-900/80 border-blue-500/20 backdrop-blur-md">
                  <CardContent className="p-12 text-center">
                    <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg mb-2">No posts yet</p>
                    <p className="text-gray-500">Be the first to share something with the community!</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trending Topics */}
            <Card className="bg-gray-900/80 border-blue-500/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Trending Topics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trendingTopics.length > 0 ? (
                    trendingTopics.map((topic, index) => (
                      <div key={topic.hashtag} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800/70 transition-colors cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                            #{index + 1}
                          </Badge>
                          <div>
                            <div className="flex items-center text-white font-medium">
                              <Hash className="h-4 w-4 mr-1 text-blue-400" />
                              {topic.hashtag}
                            </div>
                            <p className="text-gray-400 text-sm">
                              {topic.post_count} posts • {topic.user_count} users
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Hash className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400">No trending topics yet</p>
                      <p className="text-gray-500 text-sm">Start using hashtags in your posts!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Community Stats */}
            <Card className="bg-gray-900/80 border-blue-500/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Community Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-400">{posts.length}</div>
                    <div className="text-gray-400 text-sm">Total Posts</div>
                  </div>
                  <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-400">
                      {posts.reduce((sum, post) => sum + post.likes_count, 0)}
                    </div>
                    <div className="text-gray-400 text-sm">Total Likes</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;
