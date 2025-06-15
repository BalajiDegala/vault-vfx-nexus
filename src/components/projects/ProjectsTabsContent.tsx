
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Briefcase, 
  Users, 
  Star
} from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import BrowseProjectsTab from "./BrowseProjectsTab";
import MyWorkTab from "./MyWorkTab";

type Project = Database["public"]["Tables"]["projects"]["Row"];
type AppRole = Database["public"]["Enums"]["app_role"];

interface ProjectsTabsContentProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  filteredProjects: Project[];
  userRole: AppRole | null;
  userId?: string;
  onUpdate: () => void;
}

const ProjectsTabsContent: React.FC<ProjectsTabsContentProps> = ({
  activeTab,
  onTabChange,
  filteredProjects,
  userRole,
  userId,
  onUpdate
}) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-6">
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
          onUpdate={onUpdate}
        />
      </TabsContent>

      <TabsContent value="my-work">
        <MyWorkTab 
          projects={filteredProjects}
          userRole={userRole}
          userId={userId || ''}
          onUpdate={onUpdate}
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
  );
};

export default ProjectsTabsContent;
