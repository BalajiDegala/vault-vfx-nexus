
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import ProjectHeader from "@/components/projects/ProjectHeader";
import ProjectOverview from "@/components/projects/ProjectOverview";
import ProjectHierarchy from "@/components/projects/ProjectHierarchy";
import ProjectDetailWithTasks from "@/components/projects/ProjectDetailWithTasks";
import TeamDiscussion from "@/components/projects/TeamDiscussion";
import ProjectFiles from "@/components/projects/ProjectFiles";
import BidModal from "@/components/projects/BidModal";
import PresenceIndicator from "@/components/collaboration/PresenceIndicator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProjectPresence } from "@/hooks/useProjectPresence";
import { Loader2, Users, MessageSquare, FolderOpen, Files, DollarSign, Share2 } from "lucide-react";
import ProjectSharesManagement from "@/components/projects/ProjectSharesManagement";
import ProjectBiddingModal from "@/components/projects/ProjectBiddingModal";
import logger from "@/lib/logger";

type Project = Database["public"]["Tables"]["projects"]["Row"];
type AppRole = Database["public"]["Enums"]["app_role"];

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<AppRole | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showBidModal, setShowBidModal] = useState(false);
  const [showProjectBidModal, setShowProjectBidModal] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const { toast } = useToast();

  const { presenceUsers, updatePresence } = useProjectPresence(id || '', user?.id || '');

  const checkUser = useCallback(async () => {
    try {
      logger.log("Checking user authentication...");
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        logger.log("No session found, redirecting to login");
        navigate("/login");
        return;
      }

      logger.log("User authenticated:", session.user.id);
      setUser(session.user);

      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .single();

      if (roleError) {
        logger.error("Error fetching user role:", roleError);
        setUserRole("artist"); // Default fallback
      } else {
        setUserRole(roleData.role);
      }
    } catch (error: unknown) {
      logger.error("Auth error:", error);
      navigate("/login");
    } finally {
      setAuthChecked(true);
    }
  }, [navigate]);

  const fetchProject = useCallback(async () => {
    if (!id || !authChecked) {
      logger.log("Skipping project fetch - missing ID or auth not checked");
      return;
    }

    try {
      setLoading(true);
      logger.log("Fetching project with ID:", id);
      
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

      if (projectError) {
        logger.error("Error fetching project:", projectError);
        if (projectError.code === 'PGRST116') {
          toast({
            title: "Project Not Found",
            description: "The project you're looking for doesn't exist or has been deleted.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to load project details",
            variant: "destructive"
          });
        }
        navigate("/projects");
        return;
      }

      logger.log("Project data fetched successfully:", projectData);
      setProject(projectData);

    } catch (error: unknown) {
      logger.error("Error fetching project:", error);
      toast({
        title: "Error",
        description: "Failed to load project details",
        variant: "destructive"
      });
      navigate("/projects");
    } finally {
      setLoading(false);
    }
  }, [id, authChecked, navigate, toast]);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  useEffect(() => {
    if (authChecked && user && id) {
      fetchProject();
    }
  }, [authChecked, user, id, fetchProject]);

  useEffect(() => {
    if (user && id) {
      updatePresence(activeTab);
    }
  }, [activeTab, user, id, updatePresence]);

  if (!authChecked || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
        <DashboardNavbar user={user} userRole={userRole || "artist"} />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-96">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-400">
            {!authChecked ? "Checking authentication..." : "Loading project..."}
          </span>
        </div>
      </div>
    );
  }

  if (!project || !user) {
    return null;
  }

  const canBid = userRole === "artist" || userRole === "studio";
  const canBidOnProject = userRole === "studio" && project.status === "open";
  const isOwner = project.client_id === user.id;
  const isAssigned = project.assigned_to === user.id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      <DashboardNavbar user={user} userRole={userRole || "artist"} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Project Header with Presence */}
        <div className="mb-6">
          <ProjectHeader project={project} presenceUsers={presenceUsers} />
          
          <div className="flex items-center justify-between mt-4">
            <PresenceIndicator users={presenceUsers} />
            
            <div className="flex gap-2">
              {!isOwner && !isAssigned && canBid && project.status === "open" && (
                <Button 
                  onClick={() => setShowBidModal(true)}
                  className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Place Task Bid
                </Button>
              )}

              {!isOwner && canBidOnProject && (
                <Button 
                  onClick={() => setShowProjectBidModal(true)}
                  className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Bid on Project
                </Button>
              )}
              
              <Badge 
                className={
                  project.status === "open" ? "bg-green-500/20 text-green-400" :
                  project.status === "in_progress" ? "bg-blue-500/20 text-blue-400" :
                  "bg-gray-500/20 text-gray-400"
                }
              >
                {project.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>

        {/* Project Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-gray-800/50 border-gray-600 w-full justify-start">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600">
              <FolderOpen className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="tasks" className="data-[state=active]:bg-blue-600">
              <Users className="h-4 w-4 mr-2" />
              Tasks & Pipeline
            </TabsTrigger>
            <TabsTrigger value="discussion" className="data-[state=active]:bg-blue-600">
              <MessageSquare className="h-4 w-4 mr-2" />
              Discussion
            </TabsTrigger>
            <TabsTrigger value="files" className="data-[state=active]:bg-blue-600">
              <Files className="h-4 w-4 mr-2" />
              Files
            </TabsTrigger>
            <TabsTrigger value="sharing" className="data-[state=active]:bg-blue-600">
              <Share2 className="h-4 w-4 mr-2" />
              Project Sharing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <ProjectOverview project={project} />
          </TabsContent>

          <TabsContent value="tasks">
            <ProjectDetailWithTasks 
              project={project} 
              user={user}
              userRole={userRole || "artist"}
            />
          </TabsContent>

          <TabsContent value="discussion">
            <TeamDiscussion projectId={project.id} userId={user.id} />
          </TabsContent>

          <TabsContent value="files">
            <ProjectFiles projectId={project.id} userRole={userRole} />
          </TabsContent>

          <TabsContent value="sharing">
            <ProjectSharesManagement 
              project={project} 
              userRole={userRole || "artist"} 
              userId={user.id} 
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Task Bid Modal */}
      <BidModal 
        isOpen={showBidModal}
        onClose={() => setShowBidModal(false)}
        projectId={project.id}
        onSuccess={() => {
          setShowBidModal(false);
          toast({ title: "Task bid submitted successfully!" });
        }}
      />

      {/* Project Bid Modal */}
      <ProjectBiddingModal 
        isOpen={showProjectBidModal}
        onClose={() => setShowProjectBidModal(false)}
        project={project}
        onBidSubmitted={() => {
          setShowProjectBidModal(false);
          toast({ title: "Project bid submitted successfully!" });
        }}
      />
    </div>
  );
};

export default ProjectDetail;
