
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import FreelancerDashboard from "@/components/dashboard/FreelancerDashboard";
import StudioDashboard from "@/components/dashboard/StudioDashboard";
import ProducerDashboard from "@/components/dashboard/ProducerDashboard";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Dashboard: Checking authentication...");
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("Dashboard: No session found, redirecting to login");
          navigate("/login");
          return;
        }

        console.log("Dashboard: Session found for user:", session.user.id);
        setUser(session.user);

        // Get user roles with retry logic
        let rolesData = null;
        let attempts = 0;
        const maxAttempts = 3;

        while (!rolesData && attempts < maxAttempts) {
          attempts++;
          console.log(`Dashboard: Fetching roles (attempt ${attempts})...`);
          
          const { data, error: roleError } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", session.user.id);

          if (roleError) {
            console.error("Dashboard: Role fetch error:", roleError);
            if (attempts >= maxAttempts) {
              toast({
                title: "Role Fetch Error",
                description: "Unable to fetch user roles. Please try logging in again.",
                variant: "destructive",
              });
              navigate("/login");
              return;
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }

          rolesData = data;
        }

        console.log("Dashboard: Roles query result:", rolesData);

        if (!rolesData || rolesData.length === 0) {
          console.log("Dashboard: No roles found for user");
          toast({
            title: "No Role Assigned",
            description: "Please complete your registration or contact support.",
            variant: "destructive",
          });
          navigate("/login");
          return;
        }

        // Use the first available role as primary role
        const roles = rolesData.map(r => r.role);
        let selectedRole: AppRole = roles[0];

        // Prioritize roles: admin > producer > studio > artist
        if (roles.includes('admin')) selectedRole = 'admin';
        else if (roles.includes('producer')) selectedRole = 'producer';
        else if (roles.includes('studio')) selectedRole = 'studio';
        else if (roles.includes('artist')) selectedRole = 'artist';

        console.log("Dashboard: Selected role for dashboard:", selectedRole);
        setUserRole(selectedRole);
      } catch (error) {
        console.error("Dashboard: Auth check error:", error);
        toast({
          title: "Authentication Error",
          description: "Please try logging in again.",
          variant: "destructive",
        });
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Dashboard: Auth state changed:", event);
        if (event === 'SIGNED_OUT' || !session) {
          navigate("/login");
        } else if (event === 'SIGNED_IN' && session) {
          setUser(session.user);
          // Refetch roles when user signs in
          window.location.reload();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !userRole) {
    return null;
  }

  // Render role-specific dashboard
  switch (userRole) {
    case "artist":
      return <FreelancerDashboard user={user} />;
    case "studio":
      return <StudioDashboard user={user} />;
    case "producer":
      return <ProducerDashboard user={user} />;
    case "admin":
      return <AdminDashboard user={user} />;
    default:
      return <FreelancerDashboard user={user} />;
  }
};

export default Dashboard;
