
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Circle } from "lucide-react";

interface PresenceUser {
  id: string;
  user_id: string;
  status: 'online' | 'away' | 'offline';
  current_section: string;
  profile?: {
    first_name: string;
    last_name: string;
    avatar_url: string;
  };
}

interface PresenceIndicatorProps {
  users: PresenceUser[];
  className?: string;
}

const PresenceIndicator = ({ users, className = "" }: PresenceIndicatorProps) => {
  const onlineUsers = users.filter(user => user.status === 'online');

  if (onlineUsers.length === 0) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-400';
      case 'away': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex -space-x-2">
        {onlineUsers.slice(0, 3).map((user) => {
          const fullName = `${user.profile?.first_name || ''} ${user.profile?.last_name || ''}`.trim();
          const initials = fullName
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase() || '?';

          return (
            <Tooltip key={user.user_id}>
              <TooltipTrigger>
                <div className="relative">
                  <Avatar className="h-8 w-8 border-2 border-gray-800">
                    <AvatarImage src={user.profile?.avatar_url} />
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <Circle 
                    className={`absolute -bottom-1 -right-1 h-3 w-3 fill-current ${getStatusColor(user.status)}`}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-center">
                  <p className="font-medium">{fullName}</p>
                  <p className="text-xs text-gray-400">
                    {user.status} • {user.current_section}
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      {onlineUsers.length > 3 && (
        <Badge variant="secondary" className="text-xs">
          +{onlineUsers.length - 3} more
        </Badge>
      )}

      <span className="text-sm text-gray-400">
        {onlineUsers.length} online
      </span>
    </div>
  );
};

export default PresenceIndicator;
