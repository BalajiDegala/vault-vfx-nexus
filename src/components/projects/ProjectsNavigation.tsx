
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Briefcase } from "lucide-react";

interface ProjectsNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  openProjectsCount: number;
  myWorkCount: number;
  children: React.ReactNode;
}

const ProjectsNavigation = ({ 
  activeTab, 
  onTabChange, 
  openProjectsCount, 
  myWorkCount,
  children 
}: ProjectsNavigationProps) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-2 bg-gray-800/50 mb-6">
        <TabsTrigger 
          value="browse" 
          className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
        >
          <Search className="h-4 w-4" />
          Browse Projects
          <Badge variant="secondary" className="ml-1">
            {openProjectsCount}
          </Badge>
        </TabsTrigger>
        <TabsTrigger 
          value="mywork" 
          className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white"
        >
          <Briefcase className="h-4 w-4" />
          My Work
          <Badge variant="secondary" className="ml-1">
            {myWorkCount}
          </Badge>
        </TabsTrigger>
      </TabsList>
      
      {children}
    </Tabs>
  );
};

export default ProjectsNavigation;
