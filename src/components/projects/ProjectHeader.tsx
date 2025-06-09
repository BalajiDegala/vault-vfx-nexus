
import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import PresenceIndicator from "@/components/collaboration/PresenceIndicator";
import { Database } from "@/integrations/supabase/types";

type Project = Database["public"]["Tables"]["projects"]["Row"];

interface UserPresence {
  id: string;
  user_id: string;
  project_id: string;
  status: 'online' | 'away' | 'offline';
  last_seen: string;
  current_section: string;
  profile?: {
    first_name: string;
    last_name: string;
    avatar_url: string;
  };
}

interface ProjectHeaderProps {
  project: Project;
  presenceUsers: UserPresence[];
}

const ProjectHeader = ({ project, presenceUsers }: ProjectHeaderProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-500/20 text-green-400';
      case 'in_progress': return 'bg-blue-500/20 text-blue-400';
      case 'completed': return 'bg-purple-500/20 text-purple-400';
      case 'review': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{project.title}</h1>
          <p className="text-gray-400 mb-4">{project.description}</p>
          
          <div className="flex items-center gap-4">
            <Badge className={getStatusColor(project.status || 'draft')}>
              {project.status || 'draft'}
            </Badge>
            
            {project.deadline && (
              <div className="flex items-center gap-1 text-gray-400">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Due: {new Date(project.deadline).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        <PresenceIndicator users={presenceUsers} />
      </div>
    </div>
  );
};

export default ProjectHeader;
