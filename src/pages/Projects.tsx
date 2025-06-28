
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import ProjectsHub from "@/components/projects/ProjectsHub";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";
import { Loader2 } from "lucide-react";
import logger from "@/lib/logger";

type AppRole = Database["public"]["Enums"]["app_role"];

const Projects = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      logger.log("Projects page: Checking user authentication...");
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        logger.log("Projects page: No session found, redirecting to login");
        navigate("/login");
        return;
      }

      logger.log("Projects page: User authenticated:", session.user.id);
      setUser(session.user);

      // Get user role
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .single();

      if (roleError) {
        logger.error("Projects page: Error fetching user role:", roleError);
        toast({
          title: "Error",
          description: "Unable to fetch user role",
          variant: "destructive"
        });
        // Set default role to prevent blocking
        setUserRole("artist");
      } else {
        logger.log("Projects page: User role:", roleData.role);
        setUserRole(roleData.role);
      }
    } catch (error) {
      logger.error("Projects page: Auth error:", error);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
        <DashboardNavbar user={user} userRole={userRole || "artist"} />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-96">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-400">Loading projects...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      <DashboardNavbar user={user} userRole={userRole || "artist"} />
      <ProjectsHub userRole={userRole} userId={user.id} />
    </div>
  );
};

export default Projects;
