
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";
import { Save, User as UserIcon, Mail, MapPin, Globe, DollarSign } from "lucide-react";
import AvatarUpload from "@/components/profiles/AvatarUpload";
import logger from "@/lib/logger";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type AppRole = Database["public"]["Enums"]["app_role"];

const Settings = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<AppRole | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editData, setEditData] = useState<Partial<Profile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        navigate("/login");
        return;
      }

      setUser(session.user);
      await fetchProfile(session.user.id);

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .single();

      setUserRole(roleData?.role || "artist");
    } catch (error: unknown) {
      logger.error("Auth error:", error);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      setProfile(profileData);
      setEditData(profileData);
    } catch (error: unknown) {
      logger.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive"
      });
    }
  };

  const handleSave = async () => {
    if (!profile || !user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update(editData)
        .eq("id", user.id);

      if (error) throw error;

      setProfile({ ...profile, ...editData });
      
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
    } catch (error: unknown) {
      logger.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
        <DashboardNavbar user={user} userRole={userRole || "artist"} />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-gray-400">Loading settings...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const fullName = `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Anonymous User";
  const initials = fullName.split(" ").map(n => n[0]).join("").toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      <DashboardNavbar user={user} userRole={userRole || "artist"} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Account Settings</h1>
            <p className="text-gray-400">Manage your profile information and preferences</p>
          </div>

          {/* Profile Photo Section */}
          <Card className="bg-gray-900/80 border-blue-500/20 mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <UserIcon className="h-5 w-5 mr-2" />
                Profile Photo
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-6">
              <AvatarUpload
                userId={user.id}
                currentAvatarUrl={profile.avatar_url}
                initials={initials}
                onAvatarUpdate={handleAvatarUpdate}
              />
              <div>
                <p className="text-gray-300 mb-2">Upload a professional photo</p>
                <p className="text-gray-500 text-sm">Supported formats: JPG, PNG, GIF (Max 5MB)</p>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card className="bg-gray-900/80 border-blue-500/20 mb-8">
            <CardHeader>
              <CardTitle className="text-white">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-300 text-sm block mb-2">First Name</label>
                  <Input
                    value={editData.first_name || ""}
                    onChange={(e) => setEditData({...editData, first_name: e.target.value})}
                    className="bg-gray-800/50 border-gray-600 text-white"
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-sm block mb-2">Last Name</label>
                  <Input
                    value={editData.last_name || ""}
                    onChange={(e) => setEditData({...editData, last_name: e.target.value})}
                    className="bg-gray-800/50 border-gray-600 text-white"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-300 text-sm block mb-2">Username</label>
                <Input
                  value={editData.username || ""}
                  onChange={(e) => setEditData({...editData, username: e.target.value})}
                  className="bg-gray-800/50 border-gray-600 text-white"
                  placeholder="Enter your username"
                />
              </div>

              <div>
                <label className="text-gray-300 text-sm block mb-2 flex items-center">
                  <Mail className="h-4 w-4 mr-1" />
                  Email
                </label>
                <Input
                  value={profile.email}
                  disabled
                  className="bg-gray-800/30 border-gray-600 text-gray-400"
                />
                <p className="text-gray-500 text-xs mt-1">Email cannot be changed here</p>
              </div>

              <div>
                <label className="text-gray-300 text-sm block mb-2">Bio</label>
                <Textarea
                  value={editData.bio || ""}
                  onChange={(e) => setEditData({...editData, bio: e.target.value})}
                  className="bg-gray-800/50 border-gray-600 text-white"
                  rows={4}
                  placeholder="Tell us about yourself..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card className="bg-gray-900/80 border-blue-500/20 mb-8">
            <CardHeader>
              <CardTitle className="text-white">Professional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-300 text-sm block mb-2 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    Location
                  </label>
                  <Input
                    value={editData.location || ""}
                    onChange={(e) => setEditData({...editData, location: e.target.value})}
                    className="bg-gray-800/50 border-gray-600 text-white"
                    placeholder="City, Country"
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-sm block mb-2 flex items-center">
                    <Globe className="h-4 w-4 mr-1" />
                    Website
                  </label>
                  <Input
                    value={editData.website || ""}
                    onChange={(e) => setEditData({...editData, website: e.target.value})}
                    className="bg-gray-800/50 border-gray-600 text-white"
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-300 text-sm block mb-2 flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  Hourly Rate (USD)
                </label>
                <Input
                  type="number"
                  value={editData.hourly_rate || ""}
                  onChange={(e) => setEditData({...editData, hourly_rate: parseFloat(e.target.value) || 0})}
                  className="bg-gray-800/50 border-gray-600 text-white"
                  placeholder="50"
                />
              </div>

              <div>
                <label className="text-gray-300 text-sm block mb-2">Skills</label>
                <Input
                  value={editData.skills?.join(", ") || ""}
                  onChange={(e) => setEditData({...editData, skills: e.target.value.split(",").map(s => s.trim()).filter(s => s)})}
                  className="bg-gray-800/50 border-gray-600 text-white"
                  placeholder="3D Animation, VFX, Motion Graphics (comma separated)"
                />
                <p className="text-gray-500 text-xs mt-1">Separate skills with commas</p>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} size="lg">
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
