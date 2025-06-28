
import logger from "@/lib/logger";
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";
import WelcomeSection from "./WelcomeSection";
import StatsCards from "./StatsCards";
import RecentProjects from "./RecentProjects";

type AppRole = Database["public"]["Enums"]["app_role"];

interface DynamicDashboardProps {
  user: User;
  userRole: AppRole;
}

const DynamicDashboard = ({ user, userRole }: DynamicDashboardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalBudget: 0
  });
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user.id]);

  const fetchDashboardData = async () => {
    try {
      // Fetch projects statistics
      const { data: projects, error: projectsError } = await supabase
        .from("projects")
        .select("*")
        .eq("client_id", user.id);

      if (projectsError) throw projectsError;

      const totalProjects = projects?.length || 0;
      const activeProjects = projects?.filter(p => p.status === 'in_progress').length || 0;
      const completedProjects = projects?.filter(p => p.status === 'completed').length || 0;
      const totalBudget = projects?.reduce((sum, p) => sum + (p.budget_max || 0), 0) || 0;

      setStats({
        totalProjects,
        activeProjects,
        completedProjects,
        totalBudget
      });

      // Get recent projects (last 5)
      setRecentProjects(projects?.slice(0, 5) || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = () => {
    logger.log("Create project clicked - userRole:", userRole);
    if (!userRole || !["studio", "producer", "admin"].includes(userRole)) {
      toast({
        title: "Access Denied",
        description: "Only studios, producers, and admins can create projects.",
        variant: "destructive"
      });
      return;
    }
    logger.log("Navigating to projects page...");
    navigate("/projects");
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  const canCreateProject = userRole === "studio" || userRole === "producer" || userRole === "admin";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
        <span className="ml-2 text-gray-400">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <WelcomeSection 
        user={user}
        userRole={userRole}
        canCreateProject={canCreateProject}
        totalProjects={stats.totalProjects}
        onCreateProject={handleCreateProject}
      />

      <StatsCards stats={stats} />

      <RecentProjects 
        recentProjects={recentProjects}
        canCreateProject={canCreateProject}
        onCreateProject={handleCreateProject}
        onProjectClick={handleProjectClick}
      />
    </div>
  );
};

export default DynamicDashboard;
