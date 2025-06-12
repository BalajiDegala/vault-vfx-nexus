import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Edit3, 
  Save, 
  X,
  Briefcase,
  Award,
  Calendar,
  UserPlus,
  UserMinus,
  Users
} from "lucide-react";
import AvatarUpload from "./AvatarUpload";
import PortfolioGrid from "./PortfolioGrid";
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
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Profile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  // Set up real-time subscription for profile updates
  useEffect(() => {
    const channel = supabase
      .channel('profile-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`
        },
        (payload) => {
          console.log('Profile updated:', payload);
          setProfile(payload.new as Profile);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
      setEditData(profileData);

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

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update(editData)
        .eq("id", userId);

      if (error) throw error;

      setProfile({ ...profile, ...editData });
      setIsEditing(false);
      
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData(profile || {});
    setIsEditing(false);
  };

  const handleAvatarUpdate = (newUrl: string) => {
    if (profile) {
      const updatedProfile = { ...profile, avatar_url: newUrl };
      setProfile(updatedProfile);
      setEditData(updatedProfile);
    }
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
            <AvatarUpload
              userId={userId}
              currentAvatarUrl={profile.avatar_url}
              initials={initials}
              onAvatarUpdate={handleAvatarUpdate}
            />

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
                      <span>{profile.portfolio_count || 0} portfolio items</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {!isOwnProfile && currentUserId && (
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
                  )}

                  {isOwnProfile && (
                    <>
                      {isEditing ? (
                        <>
                          <Button onClick={handleSave} disabled={saving} size="sm">
                            <Save className="h-4 w-4 mr-2" />
                            {saving ? "Saving..." : "Save"}
                          </Button>
                          <Button onClick={handleCancel} variant="outline" size="sm">
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                          <Edit3 className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                      )}
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

      {/* Profile Tabs */}
      <Tabs defaultValue="portfolio" className="space-y-6">
        <TabsList className="bg-gray-800/50 border-gray-600">
          <TabsTrigger value="portfolio" className="data-[state=active]:bg-blue-600">
            <Briefcase className="h-4 w-4 mr-2" />
            Portfolio
          </TabsTrigger>
          <TabsTrigger value="projects" className="data-[state=active]:bg-blue-600">
            <Calendar className="h-4 w-4 mr-2" />
            Recent Projects
          </TabsTrigger>
          <TabsTrigger value="reviews" className="data-[state=active]:bg-blue-600">
            <Award className="h-4 w-4 mr-2" />
            Reviews
          </TabsTrigger>
          {isOwnProfile && (
            <TabsTrigger value="settings" className="data-[state=active]:bg-blue-600">
              <User className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="portfolio">
          <PortfolioGrid userId={userId} isOwnProfile={isOwnProfile} />
        </TabsContent>

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

        <TabsContent value="reviews">
          <Card className="bg-gray-900/80 border-gray-600">
            <CardContent className="p-6 text-center">
              <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No reviews yet</p>
            </CardContent>
          </Card>
        </TabsContent>

        {isOwnProfile && (
          <TabsContent value="settings">
            <Card className="bg-gray-900/80 border-gray-600">
              <CardHeader>
                <CardTitle className="text-white">Profile Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-gray-300 text-sm">First Name</label>
                        <Input
                          value={editData.first_name || ""}
                          onChange={(e) => setEditData({...editData, first_name: e.target.value})}
                          className="bg-gray-800/50 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-gray-300 text-sm">Last Name</label>
                        <Input
                          value={editData.last_name || ""}
                          onChange={(e) => setEditData({...editData, last_name: e.target.value})}
                          className="bg-gray-800/50 border-gray-600 text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-gray-300 text-sm">Bio</label>
                      <Textarea
                        value={editData.bio || ""}
                        onChange={(e) => setEditData({...editData, bio: e.target.value})}
                        className="bg-gray-800/50 border-gray-600 text-white"
                        rows={4}
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-gray-300 text-sm">Location</label>
                        <Input
                          value={editData.location || ""}
                          onChange={(e) => setEditData({...editData, location: e.target.value})}
                          className="bg-gray-800/50 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-gray-300 text-sm">Website</label>
                        <Input
                          value={editData.website || ""}
                          onChange={(e) => setEditData({...editData, website: e.target.value})}
                          className="bg-gray-800/50 border-gray-600 text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-gray-300 text-sm">Hourly Rate ($)</label>
                      <Input
                        type="number"
                        value={editData.hourly_rate || ""}
                        onChange={(e) => setEditData({...editData, hourly_rate: parseFloat(e.target.value) || 0})}
                        className="bg-gray-800/50 border-gray-600 text-white"
                      />
                    </div>
                  </>
                ) : (
                  <p className="text-gray-400">Click "Edit Profile" to modify your information</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default UserProfile;
