
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";
import { 
  Plus, 
  FolderOpen, 
  Calendar, 
  DollarSign, 
  Users, 
  TrendingUp,
  Activity,
  Clock,
  CheckCircle
} from "lucide-react";

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
      const activeProjects = projects?.filter(p => p.status === 'active').length || 0;
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
    console.log("Create project clicked - userRole:", userRole);
    if (!userRole || !["studio", "producer", "admin"].includes(userRole)) {
      toast({
        title: "Access Denied",
        description: "Only studios, producers, and admins can create projects.",
        variant: "destructive"
      });
      return;
    }
    console.log("Navigating to projects page...");
    navigate("/projects");
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
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Welcome back, {user.email?.split("@")[0]}!
          </h2>
          <p className="text-gray-400">Here's what's happening with your projects today.</p>
        </div>
        {canCreateProject && (
          <div className="mt-4 md:mt-0 space-y-2">
            <Button 
              onClick={handleCreateProject}
              className="w-full md:w-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
            {stats.totalProjects === 0 && (
              <Button 
                onClick={handleCreateProject}
                variant="outline"
                className="w-full md:w-auto border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Project
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalProjects}</div>
            <p className="text-xs text-gray-400">All time projects</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Active Projects</CardTitle>
            <Activity className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.activeProjects}</div>
            <p className="text-xs text-gray-400">Currently in progress</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.completedProjects}</div>
            <p className="text-xs text-gray-400">Successfully finished</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalBudget.toLocaleString()} V3C</div>
            <p className="text-xs text-gray-400">Combined project value</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-400" />
            Recent Projects
          </CardTitle>
          <CardDescription className="text-gray-400">
            Your latest project activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentProjects.length === 0 ? (
            <div className="text-center py-8">
              <FolderOpen className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">No projects yet</p>
              {canCreateProject && (
                <Button onClick={handleCreateProject} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Project
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <FolderOpen className="h-8 w-8 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{project.title}</h4>
                      <p className="text-gray-400 text-sm">{project.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                      {project.status}
                    </Badge>
                    <span className="text-gray-400 text-sm">
                      {new Date(project.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DynamicDashboard;
