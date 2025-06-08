
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type AppRole = Database["public"]["Enums"]["app_role"];

interface ProfileWithRoles extends Profile {
  roles: AppRole[];
}

const Profiles = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<AppRole | null>(null);
  const [profiles, setProfiles] = useState<ProfileWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate("/login");
          return;
        }

        setUser(session.user);

        // Get user roles
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

        // Fetch all profiles with their roles
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select(`
            *,
            user_roles(role)
          `);

        if (profilesError) {
          console.error("Profiles fetch error:", profilesError);
          toast({
            title: "Error",
            description: "Failed to load profiles.",
            variant: "destructive",
          });
          return;
        }

        const profilesWithRoles = profilesData?.map(profile => ({
          ...profile,
          roles: profile.user_roles?.map((ur: any) => ur.role) || []
        })) || [];

        setProfiles(profilesWithRoles);
      } catch (error) {
        console.error("Auth check error:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading profiles...</p>
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
            Community Profiles
          </h1>
          <p className="text-gray-400">
            Connect with talented VFX artists, studios, and producers
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((profile) => (
            <Card key={profile.id} className="bg-gray-900/80 border-blue-500/20 backdrop-blur-md hover:border-blue-400/40 transition-colors">
              <CardHeader className="text-center">
                <Avatar className="w-20 h-20 mx-auto mb-4">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-400 to-purple-500 text-white text-lg">
                    {profile.first_name?.[0] || profile.username?.[0] || profile.email[0]}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-white">
                  {profile.first_name && profile.last_name 
                    ? `${profile.first_name} ${profile.last_name}`
                    : profile.username || profile.email}
                </CardTitle>
                {profile.username && (
                  <p className="text-gray-400 text-sm">@{profile.username}</p>
                )}
              </CardHeader>
              
              <CardContent className="space-y-4">
                {profile.bio && (
                  <p className="text-gray-300 text-sm">{profile.bio}</p>
                )}
                
                {profile.location && (
                  <p className="text-gray-400 text-sm">📍 {profile.location}</p>
                )}
                
                {profile.roles.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {profile.roles.map((role) => (
                      <Badge 
                        key={role} 
                        variant="secondary" 
                        className="bg-blue-500/20 text-blue-400 border-blue-500/30"
                      >
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </Badge>
                    ))}
                  </div>
                )}
                
                {profile.skills && profile.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {profile.skills.slice(0, 3).map((skill) => (
                      <Badge 
                        key={skill} 
                        variant="outline" 
                        className="text-xs border-gray-600 text-gray-400"
                      >
                        {skill}
                      </Badge>
                    ))}
                    {profile.skills.length > 3 && (
                      <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                        +{profile.skills.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
                
                {profile.hourly_rate && (
                  <p className="text-blue-400 font-semibold">
                    ${profile.hourly_rate}/hour
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        
        {profiles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No profiles found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profiles;
