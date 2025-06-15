
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Settings } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface ProjectsHubHeaderProps {
  userRole?: AppRole | null;
  onCreateProject: () => void;
  onCustomizeDashboard: () => void;
}

const ProjectsHubHeader: React.FC<ProjectsHubHeaderProps> = ({
  userRole,
  onCreateProject,
  onCustomizeDashboard
}) => {
  const canCreateProject = userRole === "studio" || userRole === "producer" || userRole === "admin";

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
          VFX Projects Hub
        </h1>
        <p className="text-gray-400">Discover and manage VFX projects with advanced filtering</p>
      </div>
      <div className="flex gap-2 mt-4 md:mt-0">
        <Button
          variant="outline"
          onClick={onCustomizeDashboard}
          className="flex items-center gap-2"
        >
          <Settings className="h-4 w-4" />
          Customize Dashboard
        </Button>
        {canCreateProject && (
          <Button 
            onClick={onCreateProject}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Project
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProjectsHubHeader;
