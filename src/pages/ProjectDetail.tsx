
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import ProjectChat from "@/components/collaboration/ProjectChat";
import ProjectHierarchy from "@/components/projects/ProjectHierarchy";
import ProjectHeader from "@/components/projects/ProjectHeader";
import ProjectOverview from "@/components/projects/ProjectOverview";
import ProjectDiscussion from "@/components/projects/ProjectDiscussion";
import ProjectFiles from "@/components/projects/ProjectFiles";
import { useProjectPresence } from "@/hooks/useProjectPresence";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, MessageSquare, Users, Clock } from "lucide-react";

type Project = Database["public"]["Tables"]["projects"]["Row"];
type AppRole = Database["public"]["Enums"]["app_role"];

const ProjectDetail = () => {
  const { id } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<AppRole | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const { presenceUsers, updateSection } = useProjectPresence(id || '', user?.id || '');

  useEffect(() => {
    checkAuth();
  }, [id]);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/login");
        return;
      }

      setUser(session.user);

      // Get user role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .single();

      if (roleData) {
        setUserRole(roleData.role);
        fetchProject();
      }
    } catch (error) {
      console.error("Auth check error:", error);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchProject = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching project:", error);
        toast({
          title: "Error",
          description: "Failed to load project",
          variant: "destructive",
        });
        return;
      }

      setProject(data);
      updateSection('overview');
    } catch (error) {
      console.error("Error fetching project:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!user || !userRole || !project) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      <DashboardNavbar user={user} userRole={userRole} />
      
      <div className="container mx-auto px-4 py-8">
        <ProjectHeader project={project} presenceUsers={presenceUsers} />

        {/* Project Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-900/50">
            <TabsTrigger value="overview" onClick={() => updateSection('overview')}>
              <FileText className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="structure" onClick={() => updateSection('structure')}>
              <Users className="h-4 w-4 mr-2" />
              Structure
            </TabsTrigger>
            <TabsTrigger value="chat" onClick={() => updateSection('chat')}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Discussion
            </TabsTrigger>
            <TabsTrigger value="files" onClick={() => updateSection('files')}>
              <Clock className="h-4 w-4 mr-2" />
              Files
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <ProjectOverview project={project} />
          </TabsContent>

          <TabsContent value="structure">
            <ProjectHierarchy 
              project={project} 
              userRole={userRole} 
              userId={user.id} 
            />
          </TabsContent>

          <TabsContent value="chat">
            <TeamDiscussion projectId={id} userId={user.id} />
          </TabsContent>

          <TabsContent value="files">
            <ProjectFiles />
          </TabsContent>
        </Tabs>
      </div>

      {/* Real-time Chat */}
      <ProjectChat projectId={id || ''} userId={user.id} />
    </div>
  );
};

export default ProjectDetail;
