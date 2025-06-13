
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Users, UserPlus, MessageSquare, Eye, MapPin, Globe, Heart } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { useUserFollow } from "@/hooks/useUserFollow";
import DirectMessaging from "@/components/messaging/DirectMessaging";

type AppRole = Database["public"]["Enums"]["app_role"];

interface ProfileData {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  bio: string;
  location: string;
  website: string;
  avatar_url: string;
  skills: string[];
  hourly_rate: number;
  followers_count: number;
  following_count: number;
  portfolio_count: number;
}

const ProfileDiscovery = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<AppRole | null>(null);
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [skillFilter, setSkillFilter] = useState("all");
  const [profileFilter, setProfileFilter] = useState("all"); // all, following
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<ProfileData | null>(null);
  const [showMessaging, setShowMessaging] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchProfiles();
    }
  }, [user, profileFilter, skillFilter, searchQuery]);

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
    } finally {
      setLoading(false);
    }
  };

  const fetchProfiles = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from("profiles")
        .select("*")
        .neq("id", user.id);

      // Apply following filter
      if (profileFilter === "following") {
        const { data: followingData } = await supabase
          .from("user_follows")
          .select("following_id")
          .eq("follower_id", user.id);

        if (followingData && followingData.length > 0) {
          const followingIds = followingData.map(f => f.following_id);
          query = query.in("id", followingIds);
        } else {
          // No following users, return empty array
          setProfiles([]);
          return;
        }
      }

      // Apply search filter
      if (searchQuery) {
        query = query.or(
          `first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%,bio.ilike.%${searchQuery}%`
        );
      }

      // Apply skill filter
      if (skillFilter !== "all") {
        query = query.contains("skills", [skillFilter]);
      }

      const { data, error } = await query.limit(20);

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error("Error fetching profiles:", error);
    }
  };

  const handleProfileClick = (profile: ProfileData) => {
    navigate(`/profiles?user=${profile.id}`);
  };

  const handleMessageUser = (profile: ProfileData) => {
    setSelectedProfile(profile);
    setShowMessaging(true);
  };

  const getDisplayName = (profile: ProfileData) => {
    if (profile.first_name || profile.last_name) {
      return `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    }
    return profile.username || 'Unknown User';
  };

  const getInitials = (profile: ProfileData) => {
    const name = getDisplayName(profile);
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Get unique skills for filter
  const allSkills = Array.from(
    new Set(profiles.flatMap(profile => profile.skills || []))
  ).sort();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      <DashboardNavbar user={user} userRole={userRole || "artist"} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Discover Talent
          </h1>
          <p className="text-gray-400 text-lg">
            Connect with VFX artists, studios, and professionals worldwide
          </p>
        </div>

        {/* Filters */}
        <Card className="bg-gray-900/80 border-blue-500/20 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Search & Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search profiles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
                <Button variant="outline" size="sm" className="border-blue-500 text-blue-400">
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              <Select value={profileFilter} onValueChange={setProfileFilter}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Profile Filter" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="all">All Profiles</SelectItem>
                  <SelectItem value="following">Following Only</SelectItem>
                </SelectContent>
              </Select>

              <Select value={skillFilter} onValueChange={setSkillFilter}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Skills" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="all">All Skills</SelectItem>
                  {allSkills.map((skill) => (
                    <SelectItem key={skill} value={skill}>
                      {skill}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="text-sm text-gray-400 flex items-center">
                <Users className="h-4 w-4 mr-2" />
                {profiles.length} profile{profiles.length !== 1 ? 's' : ''} found
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {profiles.length === 0 ? (
          <Card className="bg-gray-900/80 border-blue-500/20">
            <CardContent className="text-center py-12">
              <Users className="h-16 w-16 mx-auto mb-4 text-gray-500" />
              <h3 className="text-xl font-semibold text-white mb-2">No profiles found</h3>
              <p className="text-gray-400">
                {profileFilter === "following" 
                  ? "You're not following anyone yet. Try browsing all profiles!"
                  : "Try adjusting your search or filters to find more profiles."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {profiles.map((profile) => (
              <ProfileCard 
                key={profile.id} 
                profile={profile} 
                currentUserId={user.id}
                onProfileClick={handleProfileClick}
                onMessageUser={handleMessageUser}
                getDisplayName={getDisplayName}
                getInitials={getInitials}
              />
            ))}
          </div>
        )}

        {selectedProfile && (
          <DirectMessaging
            currentUserId={user.id}
            recipientId={selectedProfile.id}
            recipientName={getDisplayName(selectedProfile)}
            recipientAvatar={selectedProfile.avatar_url}
            open={showMessaging}
            onOpenChange={setShowMessaging}
          />
        )}
      </div>
    </div>
  );
};

interface ProfileCardProps {
  profile: ProfileData;
  currentUserId: string;
  onProfileClick: (profile: ProfileData) => void;
  onMessageUser: (profile: ProfileData) => void;
  getDisplayName: (profile: ProfileData) => string;
  getInitials: (profile: ProfileData) => string;
}

const ProfileCard = ({ 
  profile, 
  currentUserId, 
  onProfileClick, 
  onMessageUser, 
  getDisplayName, 
  getInitials 
}: ProfileCardProps) => {
  const { isFollowing, loading, toggleFollow } = useUserFollow(currentUserId, profile.id);

  return (
    <Card className="bg-gray-900/80 border-blue-500/20 hover:border-blue-500/40 transition-colors">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile.avatar_url} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg">
              {getInitials(profile)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-semibold text-white truncate">
              {getDisplayName(profile)}
            </h3>
            {profile.username && (
              <p className="text-blue-400 text-sm">@{profile.username}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-gray-400 mt-2">
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                {profile.followers_count}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {profile.portfolio_count}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {profile.bio && (
          <p className="text-gray-300 text-sm line-clamp-3">{profile.bio}</p>
        )}

        {profile.location && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <MapPin className="h-3 w-3" />
            {profile.location}
          </div>
        )}

        {profile.website && (
          <div className="flex items-center gap-2 text-sm text-blue-400">
            <Globe className="h-3 w-3" />
            <a 
              href={profile.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:underline truncate"
            >
              {profile.website.replace(/^https?:\/\//, '')}
            </a>
          </div>
        )}

        {profile.skills && profile.skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {profile.skills.slice(0, 3).map((skill, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {profile.skills.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{profile.skills.length - 3}
              </Badge>
            )}
          </div>
        )}

        {profile.hourly_rate && (
          <div className="text-sm text-green-400 font-medium">
            ${profile.hourly_rate}/hour
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onProfileClick(profile)}
            className="flex-1 border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"
          >
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMessageUser(profile)}
            className="border-green-500 text-green-400 hover:bg-green-500 hover:text-white"
          >
            <MessageSquare className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFollow}
            disabled={loading}
            className={`border-purple-500 ${
              isFollowing 
                ? "bg-purple-500 text-white" 
                : "text-purple-400 hover:bg-purple-500 hover:text-white"
            }`}
          >
            <UserPlus className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileDiscovery;
