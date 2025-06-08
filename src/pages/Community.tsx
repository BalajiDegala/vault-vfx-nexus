
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarContent, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Users, TrendingUp, Send, Heart, MessageCircle } from "lucide-react";

type AppRole = Database["public"]["Enums"]["app_role"];

interface CommunityPost {
  id: string;
  author: string;
  role: AppRole;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  trending?: boolean;
}

const Community = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Sample community data (in real app, this would come from database)
  const [posts, setPosts] = useState<CommunityPost[]>([
    {
      id: "1",
      author: "Alex Rodriguez",
      role: "artist",
      content: "Just finished an amazing VFX sequence for an upcoming sci-fi film! The particle simulations took weeks to perfect, but the final result is incredible. Anyone else working on particle systems lately?",
      timestamp: "2 hours ago",
      likes: 24,
      comments: 8,
      trending: true
    },
    {
      id: "2",
      author: "Pixel Studios",
      role: "studio",
      content: "We're looking for talented compositors to join our team for a major blockbuster project. Experience with Nuke and After Effects required. Remote work available!",
      timestamp: "4 hours ago",
      likes: 45,
      comments: 12
    },
    {
      id: "3",
      author: "Sarah Chen",
      role: "producer",
      content: "Excited to announce that our latest VFX-heavy short film just got selected for Cannes! Huge thanks to all the artists who made this possible. The V3 platform has been instrumental in connecting us with amazing talent.",
      timestamp: "1 day ago",
      likes: 89,
      comments: 23,
      trending: true
    },
    {
      id: "4",
      author: "Maya Patel",
      role: "artist",
      content: "Quick tip for fellow artists: When working on complex fluid simulations, try breaking them into layers. It's much easier to control and iterate on individual elements. What are your favorite simulation techniques?",
      timestamp: "2 days ago",
      likes: 67,
      comments: 15
    }
  ]);

  const trendingTopics = [
    { tag: "#VFXTips", posts: 234 },
    { tag: "#RemoteWork", posts: 189 },
    { tag: "#ParticleEffects", posts: 156 },
    { tag: "#Compositing", posts: 142 },
    { tag: "#3DAnimation", posts: 98 }
  ];

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/login");
        return;
      }

      setUser(session.user);

      // Get user role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .single();

      if (roleData) {
        setUserRole(roleData.role);
      }
    } catch (error) {
      console.error("Auth check error:", error);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = () => {
    if (!newPost.trim()) return;

    const post: CommunityPost = {
      id: Date.now().toString(),
      author: user?.user_metadata?.first_name || user?.email || "Anonymous",
      role: userRole || "artist",
      content: newPost,
      timestamp: "Just now",
      likes: 0,
      comments: 0
    };

    setPosts([post, ...posts]);
    setNewPost("");
    
    toast({
      title: "Post Created",
      description: "Your post has been shared with the community!",
    });
  };

  const getRoleColor = (role: AppRole) => {
    switch (role) {
      case "artist": return "bg-blue-500";
      case "studio": return "bg-purple-500";
      case "producer": return "bg-green-500";
      case "admin": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getRoleLabel = (role: AppRole) => {
    switch (role) {
      case "artist": return "Artist";
      case "studio": return "Studio";
      case "producer": return "Producer";
      case "admin": return "Admin";
      default: return "User";
    }
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">V3 Community</h1>
          <p className="text-gray-400">Connect with VFX professionals, share knowledge, and grow together</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-3 space-y-6">
            {/* Create Post */}
            <Card className="bg-gray-900/80 border-blue-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-blue-400" />
                  Share with the Community
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="What's on your mind? Share your latest project, ask for advice, or start a discussion..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="bg-gray-800/50 border-gray-600 text-white min-h-[100px]"
                />
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className={`${getRoleColor(userRole)} text-white text-sm`}>
                        {(user.user_metadata?.first_name?.[0] || user.email?.[0] || "U").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-gray-300 text-sm">
                      {user.user_metadata?.first_name || user.email}
                    </span>
                    <Badge className={`${getRoleColor(userRole)} text-white`}>
                      {getRoleLabel(userRole)}
                    </Badge>
                  </div>
                  <Button 
                    onClick={handleCreatePost}
                    disabled={!newPost.trim()}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Post
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Posts Feed */}
            <div className="space-y-4">
              {posts.map((post) => (
                <Card key={post.id} className="bg-gray-900/80 border-blue-500/20">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-3 mb-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className={`${getRoleColor(post.role)} text-white`}>
                          {post.author[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-semibold text-white">{post.author}</span>
                          <Badge className={`${getRoleColor(post.role)} text-white text-xs`}>
                            {getRoleLabel(post.role)}
                          </Badge>
                          {post.trending && (
                            <Badge variant="outline" className="border-orange-500 text-orange-400 text-xs">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Trending
                            </Badge>
                          )}
                        </div>
                        <span className="text-gray-400 text-sm">{post.timestamp}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-300 mb-4 leading-relaxed">{post.content}</p>
                    
                    <div className="flex items-center space-x-6 text-gray-400">
                      <button className="flex items-center space-x-1 hover:text-red-400 transition-colors">
                        <Heart className="h-4 w-4" />
                        <span>{post.likes}</span>
                      </button>
                      <button className="flex items-center space-x-1 hover:text-blue-400 transition-colors">
                        <MessageCircle className="h-4 w-4" />
                        <span>{post.comments}</span>
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Community Stats */}
            <Card className="bg-gray-900/80 border-green-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Users className="h-5 w-5 mr-2 text-green-400" />
                  Community Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Members</span>
                  <span className="text-green-400 font-semibold">2,847</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Active Today</span>
                  <span className="text-blue-400 font-semibold">423</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Posts This Week</span>
                  <span className="text-purple-400 font-semibold">156</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Projects Shared</span>
                  <span className="text-orange-400 font-semibold">89</span>
                </div>
              </CardContent>
            </Card>

            {/* Trending Topics */}
            <Card className="bg-gray-900/80 border-orange-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-orange-400" />
                  Trending Topics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {trendingTopics.map((topic, index) => (
                  <div key={topic.tag} className="flex justify-between items-center">
                    <span className="text-blue-400 hover:text-blue-300 cursor-pointer">
                      {topic.tag}
                    </span>
                    <span className="text-gray-400 text-sm">{topic.posts} posts</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-gray-900/80 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full border-blue-500 text-blue-400 hover:bg-blue-500/10"
                  onClick={() => navigate("/projects")}
                >
                  Browse Projects
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-green-500 text-green-400 hover:bg-green-500/10"
                >
                  Find Talent
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-purple-500 text-purple-400 hover:bg-purple-500/10"
                >
                  Join Groups
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;
