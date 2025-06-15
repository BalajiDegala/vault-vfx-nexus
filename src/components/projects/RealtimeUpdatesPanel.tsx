
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Activity, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle, 
  MessageSquare,
  UserPlus,
  Settings
} from "lucide-react";

interface ProjectUpdate {
  id: string;
  type: 'status_change' | 'milestone_update' | 'assignment_change' | 'comment_added';
  message: string;
  user_id: string;
  username: string;
  timestamp: string;
  metadata?: any;
}

interface RealtimeUpdatesPanelProps {
  updates: ProjectUpdate[];
  isConnected: boolean;
}

const RealtimeUpdatesPanel: React.FC<RealtimeUpdatesPanelProps> = ({
  updates,
  isConnected,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case 'status_change':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'milestone_update':
        return <Activity className="h-4 w-4 text-blue-400" />;
      case 'assignment_change':
        return <UserPlus className="h-4 w-4 text-purple-400" />;
      case 'comment_added':
        return <MessageSquare className="h-4 w-4 text-orange-400" />;
      default:
        return <Settings className="h-4 w-4 text-gray-400" />;
    }
  };

  const getUpdateColor = (type: string) => {
    switch (type) {
      case 'status_change':
        return 'bg-green-500/20 text-green-400';
      case 'milestone_update':
        return 'bg-blue-500/20 text-blue-400';
      case 'assignment_change':
        return 'bg-purple-500/20 text-purple-400';
      case 'comment_added':
        return 'bg-orange-500/20 text-orange-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const visibleUpdates = isExpanded ? updates : updates.slice(0, 3);

  return (
    <Card className="bg-gray-900/50 border-gray-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Live Updates
            <Badge 
              variant={isConnected ? "default" : "destructive"} 
              className="text-xs"
            >
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
          </CardTitle>
          {updates.length > 3 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 w-6 p-0"
            >
              {isExpanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {updates.length === 0 ? (
          <div className="text-center py-4 text-gray-400 text-sm">
            No recent updates
          </div>
        ) : (
          <ScrollArea className={isExpanded ? "h-64" : "h-auto"}>
            <div className="space-y-3">
              {visibleUpdates.map((update) => (
                <div key={update.id} className="flex items-start gap-3 p-2 bg-gray-800/30 rounded-lg">
                  <div className="mt-0.5">
                    {getUpdateIcon(update.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white">{update.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">{update.username}</span>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getUpdateColor(update.type)}`}
                      >
                        {update.type.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(update.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
        
        {!isExpanded && updates.length > 3 && (
          <div className="text-center mt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(true)}
              className="text-xs text-gray-400 hover:text-white"
            >
              Show {updates.length - 3} more updates
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RealtimeUpdatesPanel;
