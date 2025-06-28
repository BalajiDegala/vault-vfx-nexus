
import logger from "@/lib/logger";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";
import CreateProjectModal from "./CreateProjectModal";
import EnhancedProjectsTable from "./EnhancedProjectsTable";
import DashboardCustomizer from "../dashboard/DashboardCustomizer";
import ProjectRealtimeWrapper from "./ProjectRealtimeWrapper";
import ProjectsHubHeader from "./ProjectsHubHeader";
import ProjectsStats from "./ProjectsStats";
import ProjectsTabsContent from "./ProjectsTabsContent";
import { useDashboardCustomization } from "@/hooks/useDashboardCustomization";
import { useProjectsData } from "@/hooks/useProjectsData";

type AppRole = Database["public"]["Enums"]["app_role"];

interface ProjectsHubProps {
  userRole?: AppRole | null;
  userId?: string;
}

const ProjectsHub = ({ userRole, userId }: ProjectsHubProps) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("browse");
  const { toast } = useToast();
  
  const {
    layout,
    enabledWidgets,
    isCustomizing,
    setIsCustomizing,
    toggleWidget,
    resetToDefault
  } = useDashboardCustomization(userId || '');

  const { projects, loading, stats, handleProjectUpdate } = useProjectsData();

  const handleCreateProject = () => {
    logger.log("Create project button clicked - userRole:", userRole);
    if (!userRole || !["studio", "producer", "admin"].includes(userRole)) {
      toast({
        title: "Access Denied",
        description: "Only studios, producers, and admins can create projects.",
        variant: "destructive"
      });
      return;
    }
    logger.log("Opening create project modal...");
    setIsCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    logger.log("Closing create project modal...");
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

      {/* Header with Dashboard Customization */}
      <ProjectsHubHeader
        userRole={userRole}
        onCreateProject={handleCreateProject}
        onCustomizeDashboard={() => setIsCustomizing(true)}
      />

      {/* Customizable Stats Cards */}
      <ProjectsStats 
        stats={stats}
        enabled={enabledWidgets.find(w => w.type === 'stats')?.enabled || false}
      />

      {/* Tabs */}
      <ProjectsTabsContent
        activeTab={activeTab}
        onTabChange={setActiveTab}
        filteredProjects={filteredProjects}
        userRole={userRole}
        userId={userId}
        onUpdate={handleProjectUpdate}
      />

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

      {/* Dashboard Customizer */}
      <DashboardCustomizer
        isOpen={isCustomizing}
        onClose={() => setIsCustomizing(false)}
        widgets={layout.widgets}
        onToggleWidget={toggleWidget}
        onResetToDefault={resetToDefault}
      />
    </div>
  );
};

export default ProjectsHub;
