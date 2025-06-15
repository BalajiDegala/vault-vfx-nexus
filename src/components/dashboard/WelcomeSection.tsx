
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface WelcomeSectionProps {
  user: User;
  userRole: AppRole;
  canCreateProject: boolean;
  totalProjects: number;
  onCreateProject: () => void;
}

const WelcomeSection = ({ 
  user, 
  userRole, 
  canCreateProject, 
  totalProjects, 
  onCreateProject 
}: WelcomeSectionProps) => {
  return (
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
            onClick={onCreateProject}
            className="w-full md:w-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
          {totalProjects === 0 && (
            <Button 
              onClick={onCreateProject}
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
  );
};

export default WelcomeSection;
