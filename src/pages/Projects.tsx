
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import ProjectsNavigation from "@/components/projects/ProjectsNavigation";
import BrowseProjectsTab from "@/components/projects/BrowseProjectsTab";
import MyWorkTab from "@/components/projects/MyWorkTab";
import CreateProjectModal from "@/components/projects/CreateProjectModal";
import ProjectTemplates from "@/components/projects/ProjectTemplates";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, FileText, BarChart3, TrendingUp, Users, Briefcase } from "lucide-react";
import { TabsContent } from "@/components/ui/tabs";

type Project = Database["public"]["Tables"]["projects"]["Row"];
type AppRole = Database["public"]["Enums"]["app_role"];

const Projects = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<AppRole | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [activeTab, setActiveTab] = useState("browse");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log("=== Starting auth check ===");
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log("No session found, redirecting to login");
        navigate("/login");
        return;
      }

      setUser(session.user);
      console.log("User authenticated:", session.user.id);

      // Ensure user has a profile
      await ensureUserProfile(session.user);

      // Get or create user role
      await ensureUserRole(session.user.id);

      // Fetch projects
      await fetchProjects();
    } catch (error) {
      console.error("Auth check error:", error);
      toast({
        title: "Authentication Error",
        description: "Failed to verify authentication",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const ensureUserProfile = async (user: User) => {
    try {
      console.log("Checking user profile...");
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error checking profile:", error);
        return;
      }

      if (!profile) {
        console.log("Creating user profile...");
        const { error: insertError } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            email: user.email || '',
            first_name: user.user_metadata?.first_name || '',
            last_name: user.user_metadata?.last_name || '',
            username: user.user_metadata?.username || user.email?.split('@')[0] || '',
          });

        if (insertError) {
          console.error("Error creating profile:", insertError);
        } else {
          console.log("Profile created successfully");
        }
      } else {
        console.log("Profile exists:", profile.id);
      }
    } catch (error) {
      console.error("Error ensuring user profile:", error);
    }
  };

  const ensureUserRole = async (userId: string) => {
    try {
      console.log("Checking user role...");
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      if (roleError) {
        console.error("Error checking role:", roleError);
        setUserRole('studio');
        return;
      }

      if (!roleData) {
        console.log("Creating default role for user...");
        const { error: insertError } = await supabase
          .from("user_roles")
          .insert({
            user_id: userId,
            role: 'studio'
          });

        if (insertError) {
          console.error("Error creating user role:", insertError);
        } else {
          console.log("Default role created successfully");
        }
        setUserRole('studio');
      } else {
        console.log("User role found:", roleData.role);
        setUserRole(roleData.role);
        
        // Set default tab based on role
        if (roleData.role === 'artist') {
          setActiveTab('browse');
        } else {
          setActiveTab('mywork');
        }
      }
    } catch (error) {
      console.error("Error ensuring user role:", error);
      setUserRole('studio');
    }
  };

  const fetchProjects = async () => {
    try {
      console.log("=== Fetching projects ===");
      
      // Fetch all projects - filtering will be done in components based on context
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching projects:", error);
        toast({
          title: "Error Loading Projects",
          description: `Unable to load projects: ${error.message}`,
          variant: "destructive",
        });
        setProjects([]);
        return;
      }

      console.log("Projects fetched successfully:", data?.length || 0, "projects");
      setProjects(data || []);
    } catch (error) {
      console.error("Unexpected error in fetchProjects:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading projects",
        variant: "destructive",
      });
      setProjects([]);
    }
  };

  const canCreateProject = userRole && ["studio", "producer", "admin"].includes(userRole);

  const handleTemplateSelect = (template: any) => {
    console.log("Selected template:", template);
    setShowCreateModal(true);
  };

  // Calculate statistics
  const openProjects = projects.filter(p => p.status === "open");
  const myWorkProjects = projects.filter(p => 
    userRole === 'artist' 
      ? p.assigned_to === user?.id 
      : p.client_id === user?.id && p.status !== 'open'
  );

  const stats = {
    totalProjects: projects.length,
    openProjects: openProjects.length,
    myWorkCount: myWorkProjects.length,
    activeProjects: projects.filter(p => p.status === "in_progress").length,
  };

  const handleCreateSuccess = async () => {
    console.log("=== Project creation success callback ===");
    setShowCreateModal(false);
    
    toast({
      title: "Success!",
      description: "Project created successfully.",
    });

    // Refresh the projects list
    await fetchProjects();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      <DashboardNavbar user={user} userRole={userRole || 'studio'} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
                {userRole === 'artist' ? "VFX Artist Hub" : "Project Management Hub"}
              </h1>
              <p className="text-gray-400">
                {userRole === 'artist' 
                  ? "Browse opportunities and manage your work"
                  : "Create and manage your VFX projects"}
              </p>
            </div>
            
            {canCreateProject && (
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowTemplates(true)}
                  variant="outline"
                  className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Use Template
                </Button>
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
                </Button>
              </div>
            )}
          </div>

          {/* Statistics Cards */}
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gray-900/50 border-blue-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Open Projects</p>
                    <p className="text-2xl font-bold text-blue-400">{stats.openProjects}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-green-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">My Work</p>
                    <p className="text-2xl font-bold text-green-400">{stats.myWorkCount}</p>
                  </div>
                  <Briefcase className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-purple-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Active Projects</p>
                    <p className="text-2xl font-bold text-purple-400">{stats.activeProjects}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-orange-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Projects</p>
                    <p className="text-2xl font-bold text-orange-400">{stats.totalProjects}</p>
                  </div>
                  <Users className="h-8 w-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Projects Navigation and Content */}
        <ProjectsNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          openProjectsCount={stats.openProjects}
          myWorkCount={stats.myWorkCount}
        >
          <TabsContent value="browse">
            <BrowseProjectsTab
              projects={projects}
              userRole={userRole}
              onUpdate={fetchProjects}
            />
          </TabsContent>

          <TabsContent value="mywork">
            <MyWorkTab
              projects={projects}
              userRole={userRole}
              userId={user.id}
              onUpdate={fetchProjects}
            />
          </TabsContent>
        </ProjectsNavigation>
      </div>

      {/* Modals */}
      <CreateProjectModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
        userId={user.id}
      />

      <ProjectTemplates
        open={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelectTemplate={handleTemplateSelect}
      />
    </div>
  );
};

export default Projects;
