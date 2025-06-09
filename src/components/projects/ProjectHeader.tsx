
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, DollarSign, Settings, Share2, Star } from "lucide-react";
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
      case 'active':
      case 'in_progress':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'completed':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact'
    }).format(amount);
  };

  return (
    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6 mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Project Info */}
        <div className="flex-1">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Star className="h-6 w-6 text-blue-400" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white mb-2">{project.title}</h1>
              <p className="text-gray-300 mb-4 leading-relaxed max-w-2xl">
                {project.description || 'No description provided'}
              </p>
              
              <div className="flex flex-wrap items-center gap-4">
                <Badge className={`${getStatusColor(project.status)} capitalize`}>
                  {project.status?.replace('_', ' ')}
                </Badge>
                
                {project.budget && (
                  <div className="flex items-center gap-1 text-green-400">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-sm font-medium">{formatCurrency(project.budget)}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-1 text-gray-400">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Created {formatDate(project.created_at)}</span>
                </div>
                
                {project.deadline && (
                  <div className="flex items-center gap-1 text-orange-400">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">Due {formatDate(project.deadline)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions & Presence */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Online Users */}
          {presenceUsers.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">Online:</span>
              <div className="flex -space-x-2">
                {presenceUsers.slice(0, 5).map((user) => (
                  <div
                    key={user.id}
                    className="relative w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-2 border-gray-800 flex items-center justify-center"
                    title={`${user.profile?.first_name || 'User'} - ${user.current_section}`}
                  >
                    <span className="text-white text-xs font-medium">
                      {(user.profile?.first_name?.[0] || 'U').toUpperCase()}
                    </span>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-gray-800 rounded-full"></div>
                  </div>
                ))}
                {presenceUsers.length > 5 && (
                  <div className="w-8 h-8 rounded-full bg-gray-700 border-2 border-gray-800 flex items-center justify-center">
                    <span className="text-gray-300 text-xs font-medium">
                      +{presenceUsers.length - 5}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectHeader;
