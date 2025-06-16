
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import TaskManagement from "@/components/tasks/TaskManagement";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";
import { Loader2 } from "lucide-react";

type AppRole = Database["public"]["Enums"]["app_role"];

const TasksPage = () => {
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
      console.log("Tasks page: Checking user authentication...");
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        console.log("Tasks page: No session found, redirecting to login");
        navigate("/login");
        return;
      }

      console.log("Tasks page: User authenticated:", session.user.id);
      setUser(session.user);

      // Get user role
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .single();

      if (roleError) {
        console.error("Tasks page: Error fetching user role:", roleError);
        toast({
          title: "Error",
          description: "Unable to fetch user role",
          variant: "destructive"
        });
        // Set default role to prevent blocking
        setUserRole("artist");
      } else {
        console.log("Tasks page: User role:", roleData.role);
        setUserRole(roleData.role);
      }
    } catch (error) {
      console.error("Tasks page: Auth error:", error);
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
          <span className="ml-2 text-gray-400">Loading tasks...</span>
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
      <div className="container mx-auto px-4 py-8">
        <TaskManagement 
          userRole={userRole || undefined} 
          userId={user.id} 
        />
      </div>
    </div>
  );
};

export default TasksPage;
