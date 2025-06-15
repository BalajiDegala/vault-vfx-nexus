
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Briefcase, 
  Clock, 
  Users, 
  Star,
  DollarSign,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import CreateProjectModal from "./CreateProjectModal";
import BrowseProjectsTab from "./BrowseProjectsTab";
import MyWorkTab from "./MyWorkTab";
import EnhancedProjectsTable from "./EnhancedProjectsTable";

type Project = Database["public"]["Tables"]["projects"]["Row"];
type AppRole = Database["public"]["Enums"]["app_role"];

interface ProjectsHubProps {
  userRole?: AppRole | null;
  userId?: string;
}

const ProjectsHub = ({ userRole, userId }: ProjectsHubProps) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("browse");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    openProjects: 0,
    avgBudget: 0,
    activeArtists: 0
  });
  const { toast } = useToast();

  const fetchProjects = async () => {
    try {
      setLoading(true);
      console.log("Fetching projects...");
      
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching projects:", error);
        throw error;
      }
      
      console.log("Projects fetched successfully:", data?.length || 0);
      setProjects(data || []);
    } catch (error: any) {
      console.error("Error fetching projects:", error);
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Get total projects count
      const { count: totalProjects } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true });

      // Get open projects count
      const { count: openProjects } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .eq("status", "open");

      // Get average budget
      const { data: budgetData } = await supabase
        .from("projects")
        .select("budget_min, budget_max")
        .not("budget_min", "is", null)
        .not("budget_max", "is", null);

      let avgBudget = 0;
      if (budgetData && budgetData.length > 0) {
        const totalBudget = budgetData.reduce((sum, project) => {
          return sum + ((project.budget_min || 0) + (project.budget_max || 0)) / 2;
        }, 0);
        avgBudget = totalBudget / budgetData.length;
      }

      // Get active artists count (users with artist role)
      const { count: activeArtists } = await supabase
        .from("user_roles")
        .select("*", { count: "exact", head: true })
        .eq("role", "artist");

      setStats({
        totalProjects: totalProjects || 0,
        openProjects: openProjects || 0,
        avgBudget: Math.round(avgBudget),
        activeArtists: activeArtists || 0
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchStats();
  }, []);

  const handleProjectUpdate = () => {
    console.log("Updating projects list...");
    fetchProjects();
    fetchStats();
  };

  const handleCreateProject = () => {
    console.log("Create project button clicked - userRole:", userRole);
    if (!userRole || !["studio", "producer", "admin"].includes(userRole)) {
      toast({
        title: "Access Denied",
        description: "Only studios, producers, and admins can create projects.",
        variant: "destructive"
      });
      return;
    }
    console.log("Opening create project modal...");
    setIsCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    console.log("Closing create project modal...");
    setIsCreateModalOpen(false);
  };

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes("") ||
    project.description?.toLowerCase().includes("") ||
    project.skills_required?.some(skill => 
      skill.toLowerCase().includes("")
    )
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-400">Loading projects...</span>
        </div>
      </div>
    );
  }

  const canCreateProject = userRole === "studio" || userRole === "producer" || userRole === "admin";

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Enhanced Projects Table (global overview) */}
      <EnhancedProjectsTable userRole={userRole} userId={userId} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
            VFX Projects Hub
          </h1>
          <p className="text-gray-400">Discover and manage VFX projects with advanced filtering</p>
        </div>
        {canCreateProject && (
          <Button 
            onClick={handleCreateProject}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 mt-4 md:mt-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Project
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <StatsCard 
          icon={<Briefcase />} 
          label="Total Projects" 
          value={stats.totalProjects.toString()} 
        />
        <StatsCard 
          icon={<Clock />} 
          label="Open Projects" 
          value={stats.openProjects.toString()} 
        />
        <StatsCard 
          icon={<DollarSign />} 
          label="Avg Budget" 
          value={stats.avgBudget > 0 ? `$${stats.avgBudget.toLocaleString()}` : "N/A"} 
        />
        <StatsCard 
          icon={<Users />} 
          label="Active Artists" 
          value={stats.activeArtists.toString()} 
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-gray-800/50 border-gray-600">
          <TabsTrigger value="browse" className="data-[state=active]:bg-blue-600">
            <Briefcase className="h-4 w-4 mr-2" />
            Browse Projects
          </TabsTrigger>
          <TabsTrigger value="my-work" className="data-[state=active]:bg-blue-600">
            <Users className="h-4 w-4 mr-2" />
            My Work
          </TabsTrigger>
          <TabsTrigger value="saved" className="data-[state=active]:bg-blue-600">
            <Star className="h-4 w-4 mr-2" />
            Saved
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          <BrowseProjectsTab 
            projects={filteredProjects}
            userRole={userRole}
            onUpdate={handleProjectUpdate}
          />
        </TabsContent>

        <TabsContent value="my-work">
          <MyWorkTab 
            projects={filteredProjects}
            userRole={userRole}
            userId={userId}
            onUpdate={handleProjectUpdate}
          />
        </TabsContent>

        <TabsContent value="saved">
          <div className="text-center py-12">
            <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No saved projects</h3>
            <p className="text-gray-400">Save projects you're interested in</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Project Modal */}
      {canCreateProject && (
        <CreateProjectModal 
          isOpen={isCreateModalOpen}
          onClose={handleCloseModal}
          onSuccess={() => {
            handleCloseModal();
            handleProjectUpdate();
            toast({
              title: "Success",
              description: "Project created successfully!",
            });
          }}
        />
      )}
    </div>
  );
};

const StatsCard = ({ icon, label, value }: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <Card className="bg-gray-800/50 border-gray-600">
    <CardContent className="p-4">
      <div className="flex items-center space-x-3">
        <div className="text-blue-400">
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-sm text-gray-400">{label}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default ProjectsHub;
