import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Circle } from "lucide-react";

interface ProjectPresence {
  user_id: string;
  username: string;
  avatar_url?: string;
  current_section: string;
  last_seen: string;
}

interface ProjectPresenceIndicatorProps {
  activeUsers: ProjectPresence[];
  currentSection?: string;
}

const ProjectPresenceIndicator: React.FC<ProjectPresenceIndicatorProps> = ({
  activeUsers,
  currentSection,
}) => {
  const usersInCurrentSection = currentSection 
    ? activeUsers.filter(user => user.current_section === currentSection)
    : [];

  const otherActiveUsers = currentSection
    ? activeUsers.filter(user => user.current_section !== currentSection)
    : activeUsers;

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    return `${Math.floor(diffInMinutes / 60)}h ago`;
  };

  const getSectionLabel = (section: string) => {
    const labels: Record<string, string> = {
      overview: 'Overview',
      tasks: 'Tasks',
      files: 'Files',
      discussion: 'Discussion',
      settings: 'Settings',
    };
    return labels[section] || section;
  };

  if (activeUsers.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Circle className="h-3 w-3 fill-gray-500" />
        <span>No other users online</span>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-3">
        {/* Users in current section */}
        {usersInCurrentSection.length > 0 && (
          <div className="flex items-center gap-2">
            <Circle className="h-3 w-3 fill-green-500 text-green-500" />
            <div className="flex -space-x-2">
              {usersInCurrentSection.slice(0, 3).map((user) => (
                <Tooltip key={user.user_id}>
                  <TooltipTrigger>
                    <Avatar className="h-6 w-6 border-2 border-background">
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{user.username} • {getSectionLabel(user.current_section)}</p>
                    <p className="text-xs text-gray-400">Active {formatTimeAgo(user.last_seen)}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
              {usersInCurrentSection.length > 3 && (
                <Badge variant="secondary" className="h-6 w-6 rounded-full p-0 text-xs">
                  +{usersInCurrentSection.length - 3}
                </Badge>
              )}
            </div>
            <span className="text-xs text-green-400">viewing this section</span>
          </div>
        )}

        {/* Other active users */}
        {otherActiveUsers.length > 0 && (
          <div className="flex items-center gap-2">
            <Circle className="h-3 w-3 fill-blue-500 text-blue-500" />
            <div className="flex -space-x-2">
              {otherActiveUsers.slice(0, 3).map((user) => (
                <Tooltip key={user.user_id}>
                  <TooltipTrigger>
                    <Avatar className="h-6 w-6 border-2 border-background">
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{user.username} • {getSectionLabel(user.current_section)}</p>
                    <p className="text-xs text-gray-400">Active {formatTimeAgo(user.last_seen)}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
              {otherActiveUsers.length > 3 && (
                <Badge variant="secondary" className="h-6 w-6 rounded-full p-0 text-xs">
                  +{otherActiveUsers.length - 3}
                </Badge>
              )}
            </div>
            <span className="text-xs text-blue-400">online elsewhere</span>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default ProjectPresenceIndicator;
