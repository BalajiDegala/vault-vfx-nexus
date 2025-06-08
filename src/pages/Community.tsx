
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageSquare, Users, TrendingUp, Send, Heart, MessageCircle, UserPlus, Search } from "lucide-react";

type AppRole = Database["public"]["Enums"]["app_role"];

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  email: string;
  roles: AppRole[];
}

interface CommunityPost {
  id: string;
  author_id: string;
  content: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  mentioned_users: string[];
  trending: boolean;
  author?: {
    first_name: string | null;
    last_name: string | null;
    username: string | null;
    email: string;
    user_roles: { role: AppRole }[];
  };
  liked_by_user?: boolean;
}

const Community = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [newPost, setNewPost] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<Profile[]>([]);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<AppRole | "all">("all");
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  const trendingTopics = [
    { tag: "#VFXTips", posts: 234 },
    { tag: "#RemoteWork", posts: 189 },
    { tag: "#ParticleEffects", posts: 156 },
    { tag: "#Compositing", posts: 142 },
    { tag: "#3DAnimation", posts: 98 }
  ];

  useEffect(() => {
    checkAuth();
    fetchAllProfiles();
  }, []);

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user]);

  useEffect(() => {
    filterProfiles();
  }, [allProfiles, searchQuery, roleFilter]);

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

  const fetchPosts = async () => {
    try {
      setPostsLoading(true);
      
      // Fetch posts with author details and user's like status
      const { data: postsData, error: postsError } = await supabase
        .from("community_posts")
        .select(`
          *,
          author:profiles(
            first_name,
            last_name,
            username,
            email,
            user_roles(role)
          )
        `)
        .order("created_at", { ascending: false });

      if (postsError) {
        console.error("Error fetching posts:", postsError);
        return;
      }

      // Check which posts the current user has liked
      const postIds = postsData?.map(post => post.id) || [];
      const { data: likesData } = await supabase
        .from("community_post_likes")
        .select("post_id")
        .eq("user_id", user?.id || "")
        .in("post_id", postIds);

      const likedPostIds = new Set(likesData?.map(like => like.post_id) || []);

      const postsWithLikes = postsData?.map(post => ({
        ...post,
        liked_by_user: likedPostIds.has(post.id)
      })) || [];

      setPosts(postsWithLikes);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setPostsLoading(false);
    }
  };

  const fetchAllProfiles = async () => {
    try {
      const { data: profilesData, error } = await supabase
        .from("profiles")
        .select(`
          *,
          user_roles(role)
        `);

      if (error) {
        console.error("Error fetching profiles:", error);
        return;
      }

      const profilesWithRoles = profilesData?.map(profile => ({
        id: profile.id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        username: profile.username,
        email: profile.email,
        roles: profile.user_roles?.map((ur: any) => ur.role) || []
      })) || [];

      setAllProfiles(profilesWithRoles);
    } catch (error) {
      console.error("Error fetching profiles:", error);
    }
  };

  const filterProfiles = () => {
    let filtered = allProfiles;

    if (searchQuery) {
      filtered = filtered.filter(profile => 
        profile.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter(profile => 
        profile.roles.includes(roleFilter as AppRole)
      );
    }

    setFilteredProfiles(filtered);
  };

  const handleUserSelect = (profile: Profile) => {
    if (!selectedUsers.find(u => u.id === profile.id)) {
      setSelectedUsers([...selectedUsers, profile]);
    }
    setShowUserSearch(false);
  };

  const removeSelectedUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter(u => u.id !== userId));
  };

  const handleCreatePost = async () => {
    if (!newPost.trim() || !user) return;

    try {
      const { data: postData, error } = await supabase
        .from("community_posts")
        .insert({
          author_id: user.id,
          content: newPost,
          mentioned_users: selectedUsers.map(u => u.id)
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating post:", error);
        toast({
          title: "Error",
          description: "Failed to create post. Please try again.",
          variant: "destructive"
        });
        return;
      }

      setNewPost("");
      setSelectedUsers([]);
      
      toast({
        title: "Post Created",
        description: `Your post has been shared with the community${selectedUsers.length > 0 ? ` and ${selectedUsers.length} users mentioned` : ''}!`,
      });

      // Refresh posts
      fetchPosts();
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!user) return;

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    try {
      if (post.liked_by_user) {
        // Unlike the post
        const { error } = await supabase
          .from("community_post_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);

        if (error) {
          console.error("Error unliking post:", error);
          return;
        }
      } else {
        // Like the post
        const { error } = await supabase
          .from("community_post_likes")
          .insert({
            post_id: postId,
            user_id: user.id
          });

        if (error) {
          console.error("Error liking post:", error);
          return;
        }
      }

      // Update local state immediately for better UX
      setPosts(posts.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            likes_count: p.liked_by_user ? p.likes_count - 1 : p.likes_count + 1,
            liked_by_user: !p.liked_by_user
          };
        }
        return p;
      }));
    } catch (error) {
      console.error("Error handling like:", error);
    }
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

  const getAuthorName = (post: CommunityPost) => {
    if (post.author) {
      return post.author.username || 
             `${post.author.first_name || ''} ${post.author.last_name || ''}`.trim() || 
             post.author.email;
    }
    return "Unknown User";
  };

  const getAuthorRole = (post: CommunityPost): AppRole => {
    return post.author?.user_roles?.[0]?.role || "artist";
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
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
                
                {/* User Selection */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowUserSearch(true)}
                      className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Mention Users
                    </Button>
                    {selectedUsers.length > 0 && (
                      <span className="text-sm text-gray-400">
                        {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} mentioned
                      </span>
                    )}
                  </div>
                  
                  {selectedUsers.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedUsers.map(profile => (
                        <Badge
                          key={profile.id}
                          variant="secondary"
                          className="bg-blue-500/20 text-blue-400 border-blue-500/30"
                        >
                          @{profile.username || profile.first_name || profile.email}
                          <button
                            onClick={() => removeSelectedUser(profile.id)}
                            className="ml-2 text-blue-300 hover:text-white"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

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
              {postsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                </div>
              ) : posts.length === 0 ? (
                <Card className="bg-gray-900/80 border-blue-500/20">
                  <CardContent className="p-8 text-center">
                    <MessageSquare className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">No posts yet. Be the first to share something!</p>
                  </CardContent>
                </Card>
              ) : (
                posts.map((post) => (
                  <Card key={post.id} className="bg-gray-900/80 border-blue-500/20">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-3 mb-4">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className={`${getRoleColor(getAuthorRole(post))} text-white`}>
                            {getAuthorName(post)[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-semibold text-white">{getAuthorName(post)}</span>
                            <Badge className={`${getRoleColor(getAuthorRole(post))} text-white text-xs`}>
                              {getRoleLabel(getAuthorRole(post))}
                            </Badge>
                            {post.trending && (
                              <Badge variant="outline" className="border-orange-500 text-orange-400 text-xs">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                Trending
                              </Badge>
                            )}
                          </div>
                          <span className="text-gray-400 text-sm">{formatTimestamp(post.created_at)}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-300 mb-4 leading-relaxed">{post.content}</p>
                      
                      {post.mentioned_users && post.mentioned_users.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm text-blue-400">
                            Mentioned {post.mentioned_users.length} user{post.mentioned_users.length > 1 ? 's' : ''}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-6 text-gray-400">
                        <button 
                          onClick={() => handleLikePost(post.id)}
                          className={`flex items-center space-x-1 transition-colors ${
                            post.liked_by_user
                              ? 'text-red-400' 
                              : 'hover:text-red-400'
                          }`}
                        >
                          <Heart className={`h-4 w-4 ${post.liked_by_user ? 'fill-current' : ''}`} />
                          <span>{post.likes_count}</span>
                        </button>
                        <button className="flex items-center space-x-1 hover:text-blue-400 transition-colors">
                          <MessageCircle className="h-4 w-4" />
                          <span>{post.comments_count}</span>
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Search */}
            <Card className="bg-gray-900/80 border-green-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Search className="h-5 w-5 mr-2 text-green-400" />
                  Find Users
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-gray-800/50 border-gray-600 text-white"
                />
                <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as AppRole | "all")}>
                  <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="artist">Artists</SelectItem>
                    <SelectItem value="studio">Studios</SelectItem>
                    <SelectItem value="producer">Producers</SelectItem>
                    <SelectItem value="admin">Admins</SelectItem>
                  </SelectContent>
                </Select>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {filteredProfiles.slice(0, 5).map(profile => (
                    <div
                      key={profile.id}
                      className="flex items-center justify-between p-2 bg-gray-800/30 rounded cursor-pointer hover:bg-gray-700/30"
                      onClick={() => handleUserSelect(profile)}
                    >
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-blue-500 text-white text-xs">
                            {(profile.first_name?.[0] || profile.email[0]).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-white">
                          {profile.username || profile.first_name || profile.email}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {profile.roles[0] || 'user'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

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
                  <span className="text-green-400 font-semibold">{allProfiles.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Active Today</span>
                  <span className="text-blue-400 font-semibold">
                    {Math.floor(allProfiles.length * 0.15)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Posts This Week</span>
                  <span className="text-purple-400 font-semibold">{posts.length}</span>
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
                  onClick={() => navigate("/profiles")}
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

      {/* User Search Dialog */}
      <CommandDialog open={showUserSearch} onOpenChange={setShowUserSearch}>
        <CommandInput placeholder="Search users..." />
        <CommandList>
          <CommandEmpty>No users found.</CommandEmpty>
          <CommandGroup heading="Users">
            {filteredProfiles.map(profile => (
              <CommandItem
                key={profile.id}
                onSelect={() => handleUserSelect(profile)}
              >
                <div className="flex items-center space-x-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-blue-500 text-white text-xs">
                      {(profile.first_name?.[0] || profile.email[0]).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span>{profile.username || profile.first_name || profile.email}</span>
                  <Badge variant="outline" className="text-xs">
                    {profile.roles[0] || 'user'}
                  </Badge>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
};

export default Community;
