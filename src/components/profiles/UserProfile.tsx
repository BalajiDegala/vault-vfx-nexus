
import logger from "@/lib/logger";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";
import { 
  User, 
  Mail, 
  MapPin, 
  Globe, 
  DollarSign, 
  Star, 
  Briefcase,
  Calendar,
  UserPlus,
  UserMinus,
  Users,
  MessageCircle
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserFollow } from "@/hooks/useUserFollow";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type AppRole = Database["public"]["Enums"]["app_role"];

interface UserProfileProps {
  userId: string;
  currentUserRole?: AppRole | null;
}

const UserProfile = ({ userId, currentUserRole }: UserProfileProps) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRole, setUserRole] = useState<AppRole | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Get current user ID for follow functionality
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUserId(session?.user?.id || null);
    };
    getCurrentUser();
  }, []);

  const { isFollowing, loading: followLoading, toggleFollow } = useUserFollow(currentUserId, userId);

  useEffect(() => {
    fetchProfile();
    fetchUserProjects();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch user role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .single();

      setUserRole(roleData?.role || "artist");

      // Track profile view if not own profile
      if (currentUserId && currentUserId !== userId) {
        await supabase
          .from("profile_views")
          .insert({
            viewer_id: currentUserId,
            profile_id: userId
          });
      }
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .or(`client_id.eq.${userId},assigned_to.eq.${userId}`)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const handleMessage = () => {
    // TODO: Implement messaging functionality
    logger.log("Start conversation with", userId);
    toast({
      title: "Coming Soon",
      description: "Messaging functionality will be available soon"
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-gray-400">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Profile not found</h2>
        </div>
      </div>
    );
  }

  const fullName = `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Anonymous User";
  const initials = fullName.split(" ").map(n => n[0]).join("").toUpperCase();
  const isOwnProfile = currentUserId === userId;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <Card className="bg-gray-900/80 border-blue-500/20 mb-8">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="h-32 w-32 border-4 border-blue-500/30">
              <AvatarImage src={profile.avatar_url || ""} />
              <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{fullName}</h1>
                  <div className="flex items-center gap-2 mb-2">
                    {userRole && (
                      <Badge className="bg-blue-500/20 text-blue-400 capitalize">
                        {userRole}
                      </Badge>
                    )}
                    <div className="flex items-center text-gray-400">
                      <Star className="h-4 w-4 mr-1 text-yellow-400" />
                      <span>4.8 (24 reviews)</span>
                    </div>
                    {profile.online_status === 'online' && (
                      <Badge className="bg-green-500/20 text-green-400">
                        Online
                      </Badge>
                    )}
                  </div>
                  
                  {/* Social Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{profile.followers_count || 0} followers</span>
                    </div>
                    <div className="flex items-center">
                      <span>{profile.following_count || 0} following</span>
                    </div>
                    <div className="flex items-center">
                      <Briefcase className="h-4 w-4 mr-1" />
                      <span>{projects.length} projects</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {!isOwnProfile && currentUserId && (
                    <>
                      <Button 
                        onClick={toggleFollow}
                        disabled={followLoading}
                        variant={isFollowing ? "outline" : "default"}
                      >
                        {isFollowing ? (
                          <>
                            <UserMinus className="h-4 w-4 mr-2" />
                            Unfollow
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Follow
                          </>
                        )}
                      </Button>

                      <Button onClick={handleMessage} variant="secondary">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 text-gray-300">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-blue-400" />
                  {profile.email}
                </div>
                {profile.location && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-green-400" />
                    {profile.location}
                  </div>
                )}
                {profile.website && (
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 mr-2 text-purple-400" />
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" 
                       className="hover:text-purple-400 transition-colors">
                      {profile.website}
                    </a>
                  </div>
                )}
                {profile.hourly_rate && (
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-yellow-400" />
                    ${profile.hourly_rate}/hour
                  </div>
                )}
              </div>

              {profile.bio && (
                <p className="text-gray-300 max-w-2xl">{profile.bio}</p>
              )}

              {profile.skills && profile.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <Badge key={index} variant="outline" className="border-blue-500/30 text-blue-400">
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Tabs - Simplified without portfolio */}
      <Tabs defaultValue="projects" className="space-y-6">
        <TabsList className="bg-gray-800/50 border-gray-600">
          <TabsTrigger value="projects" className="data-[state=active]:bg-blue-600">
            <Calendar className="h-4 w-4 mr-2" />
            Recent Projects
          </TabsTrigger>
          <TabsTrigger value="about" className="data-[state=active]:bg-blue-600">
            <User className="h-4 w-4 mr-2" />
            About
          </TabsTrigger>
        </TabsList>

        <TabsContent value="projects">
          <div className="space-y-4">
            {projects.map((project) => (
              <Card key={project.id} className="bg-gray-900/80 border-gray-600">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{project.title}</h3>
                      <p className="text-gray-400 text-sm">{project.description}</p>
                    </div>
                    <Badge className={
                      project.status === "completed" ? "bg-green-500/20 text-green-400" :
                      project.status === "in_progress" ? "bg-blue-500/20 text-blue-400" :
                      "bg-gray-500/20 text-gray-400"
                    }>
                      {project.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
            {projects.length === 0 && (
              <Card className="bg-gray-900/80 border-gray-600">
                <CardContent className="p-6 text-center">
                  <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">No projects yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="about">
          <Card className="bg-gray-900/80 border-gray-600">
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Professional Information</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-gray-300">
                    <div>
                      <span className="text-gray-400">Role:</span>
                      <span className="ml-2 capitalize">{userRole}</span>
                    </div>
                    {profile.location && (
                      <div>
                        <span className="text-gray-400">Location:</span>
                        <span className="ml-2">{profile.location}</span>
                      </div>
                    )}
                    {profile.hourly_rate && (
                      <div>
                        <span className="text-gray-400">Rate:</span>
                        <span className="ml-2">${profile.hourly_rate}/hour</span>
                      </div>
                    )}
                    {profile.website && (
                      <div>
                        <span className="text-gray-400">Website:</span>
                        <a href={profile.website} target="_blank" rel="noopener noreferrer" 
                           className="ml-2 text-blue-400 hover:underline">
                          {profile.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {profile.bio && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">About</h3>
                    <p className="text-gray-300">{profile.bio}</p>
                  </div>
                )}

                {profile.skills && profile.skills.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill, index) => (
                        <Badge key={index} variant="outline" className="border-blue-500/30 text-blue-400">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfile;
