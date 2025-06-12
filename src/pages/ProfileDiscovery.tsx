import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, MapPin, Users, MessageCircle, UserPlus, UserMinus } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { useUserFollow } from "@/hooks/useUserFollow";
import DirectMessaging from "@/components/messaging/DirectMessaging";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type AppRole = Database["public"]["Enums"]["app_role"];

const ProfileDiscovery = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<AppRole | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [messagingUser, setMessagingUser] = useState<Profile | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
    fetchProfiles();
  }, []);

  useEffect(() => {
    filterProfiles();
  }, [profiles, searchTerm, selectedRole]);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        navigate("/login");
        return;
      }

      setUser(session.user);

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .single();

      setUserRole(roleData?.role || "artist");
    } catch (error) {
      console.error("Auth error:", error);
      navigate("/login");
    }
  };

  const fetchProfiles = async () => {
    try {
      console.log("Fetching all profiles...");
      
      // First get all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw profilesError;
      }

      console.log("Profiles fetched:", profilesData?.length || 0);

      // Then get user roles separately and match them
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) {
        console.error("Error fetching roles:", rolesError);
      }

      // Combine profiles with their roles
      const profilesWithRoles = (profilesData || []).map(profile => {
        const userRole = rolesData?.find(role => role.user_id === profile.id);
        return {
          ...profile,
          user_roles: userRole ? { role: userRole.role } : null
        };
      });

      console.log("Profiles with roles:", profilesWithRoles);
      setProfiles(profilesWithRoles);
    } catch (error) {
      console.error("Error fetching profiles:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterProfiles = () => {
    let filtered = profiles;

    console.log("Starting filter with profiles:", filtered.length);

    // Filter out current user
    if (user) {
      filtered = filtered.filter(profile => profile.id !== user.id);
      console.log("After filtering out current user:", filtered.length);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(profile => 
        profile.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      console.log("After search filter:", filtered.length);
    }

    // Role filter - only filter if a specific role is selected
    if (selectedRole !== "all") {
      filtered = filtered.filter(profile => 
        (profile as any).user_roles?.role === selectedRole
      );
      console.log("After role filter:", filtered.length);
    }

    console.log("Final filtered profiles:", filtered.length);
    setFilteredProfiles(filtered);
  };

  const getFullName = (profile: Profile) => {
    return `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Anonymous User";
  };

  const getInitials = (profile: Profile) => {
    const name = getFullName(profile);
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
        <DashboardNavbar user={user} userRole={userRole || "artist"} />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-gray-400">Loading talent...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      <DashboardNavbar user={user} userRole={userRole || "artist"} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">Find Talent</h1>
          <p className="text-gray-400 mb-6">Connect with artists, studios, and producers in the VFX community</p>
          
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name, skills, or bio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800/50 border-gray-600 text-white"
              />
            </div>
            
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white"
            >
              <option value="all">All Roles</option>
              <option value="artist">Artists</option>
              <option value="studio">Studios</option>
              <option value="producer">Producers</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>

        {/* Profiles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProfiles.map((profile) => (
            <ProfileCard 
              key={profile.id} 
              profile={profile}
              currentUserId={user?.id || null}
              onViewProfile={() => navigate(`/profiles?user=${profile.id}`)}
              onMessage={() => setMessagingUser(profile)}
            />
          ))}
        </div>

        {filteredProfiles.length === 0 && !loading && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">
              {profiles.length === 0 
                ? "No profiles found in the system" 
                : "No talent found matching your criteria"
              }
            </p>
            {profiles.length === 0 && (
              <p className="text-gray-500 text-sm mt-2">
                Try creating some test users or check if users have completed their profiles
              </p>
            )}
          </div>
        )}
      </div>

      {/* Direct Messaging Modal */}
      {messagingUser && user && (
        <DirectMessaging
          currentUserId={user.id}
          recipientId={messagingUser.id}
          recipientName={getFullName(messagingUser)}
          recipientAvatar={messagingUser.avatar_url || undefined}
          open={!!messagingUser}
          onOpenChange={(open) => !open && setMessagingUser(null)}
        />
      )}
    </div>
  );
};

const ProfileCard = ({ profile, currentUserId, onViewProfile, onMessage }: {
  profile: Profile & { user_roles?: { role: string } | null };
  currentUserId: string | null;
  onViewProfile: () => void;
  onMessage: () => void;
}) => {
  const { isFollowing, loading: followLoading, toggleFollow } = useUserFollow(currentUserId, profile.id);

  const getFullName = (profile: Profile) => {
    return `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Anonymous User";
  };

  const getInitials = (profile: Profile) => {
    const name = getFullName(profile);
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  return (
    <Card className="bg-gray-900/80 border-gray-600 hover:border-blue-500/50 transition-colors">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          <Avatar className="h-20 w-20 mb-4 border-2 border-blue-500/30">
            <AvatarImage src={profile.avatar_url || ""} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              {getInitials(profile)}
            </AvatarFallback>
          </Avatar>
          
          <h3 className="text-lg font-semibold text-white mb-1">
            {getFullName(profile)}
          </h3>
          
          {profile.user_roles?.role && (
            <Badge className="bg-blue-500/20 text-blue-400 capitalize mb-2">
              {profile.user_roles.role}
            </Badge>
          )}
          
          {profile.bio && (
            <p className="text-gray-400 text-sm mb-3 line-clamp-2">
              {profile.bio}
            </p>
          )}
          
          {profile.location && (
            <div className="flex items-center text-gray-400 text-sm mb-3">
              <MapPin className="h-3 w-3 mr-1" />
              {profile.location}
            </div>
          )}
          
          <div className="flex items-center justify-center text-xs text-gray-400 mb-4">
            <div className="flex items-center mr-4">
              <Users className="h-3 w-3 mr-1" />
              {profile.followers_count || 0} followers
            </div>
            {profile.online_status === 'online' && (
              <Badge className="bg-green-500/20 text-green-400">
                Online
              </Badge>
            )}
          </div>
          
          {profile.skills && profile.skills.length > 0 && (
            <div className="flex flex-wrap gap-1 justify-center mb-4">
              {profile.skills.slice(0, 3).map((skill, index) => (
                <Badge key={index} variant="outline" className="text-xs border-gray-600 text-gray-400">
                  {skill}
                </Badge>
              ))}
              {profile.skills.length > 3 && (
                <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                  +{profile.skills.length - 3}
                </Badge>
              )}
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex gap-2 w-full">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onViewProfile}
              className="flex-1"
            >
              View Profile
            </Button>
            
            {currentUserId && (
              <>
                <Button 
                  size="sm"
                  onClick={toggleFollow}
                  disabled={followLoading}
                  variant={isFollowing ? "outline" : "default"}
                  className="flex-1"
                >
                  {isFollowing ? (
                    <>
                      <UserMinus className="h-3 w-3 mr-1" />
                      Unfollow
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-3 w-3 mr-1" />
                      Follow
                    </>
                  )}
                </Button>
                
                <Button 
                  size="sm"
                  variant="secondary"
                  onClick={onMessage}
                  className="px-3"
                >
                  <MessageCircle className="h-3 w-3" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileDiscovery;
