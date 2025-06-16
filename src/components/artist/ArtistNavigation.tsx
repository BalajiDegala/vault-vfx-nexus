
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, Search, Briefcase } from "lucide-react";
import ArtistTasksView from "./ArtistTasksView";

interface ArtistNavigationProps {
  userId: string;
}

const ArtistNavigation = ({ userId }: ArtistNavigationProps) => {
  return (
    <Tabs defaultValue="my-tasks" className="w-full">
      <TabsList className="grid w-full grid-cols-2 bg-gray-800/50 mb-6">
        <TabsTrigger 
          value="my-tasks" 
          className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
        >
          <CheckSquare className="h-4 w-4" />
          My Assigned Tasks
        </TabsTrigger>
        <TabsTrigger 
          value="browse-projects" 
          className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white"
        >
          <Search className="h-4 w-4" />
          Browse Projects
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="my-tasks">
        <ArtistTasksView userId={userId} />
      </TabsContent>
      
      <TabsContent value="browse-projects">
        <div className="text-center py-20">
          <Search className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Browse Available Projects</h3>
          <p className="text-gray-400 mb-6">Discover new project opportunities and submit bids.</p>
          <p className="text-sm text-gray-500">This feature will allow you to browse open projects and submit task-specific bids.</p>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default ArtistNavigation;
