
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, User, AlertCircle, CheckCircle2, Play } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type Task = Database["public"]["Tables"]["tasks"]["Row"];

interface TaskCardProps {
  task: Task;
  onStatusChange?: (taskId: string, newStatus: string) => void;
  onAssign?: (taskId: string) => void;
  showActions?: boolean;
}

const TaskCard = ({ task, onStatusChange, onAssign, showActions = true }: TaskCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'in_progress':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'blocked':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'todo':
        return <AlertCircle className="h-4 w-4" />;
      case 'in_progress':
        return <Play className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <Card className="bg-gray-900/50 border-gray-700 hover:border-blue-500/50 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold text-white line-clamp-2">
            {task.name}
          </CardTitle>
          <div className="flex gap-2">
            <Badge className={`${getStatusColor(task.status)} flex items-center gap-1`}>
              {getStatusIcon(task.status)}
              {task.status.replace('_', ' ')}
            </Badge>
            <Badge className={`${getPriorityColor(task.priority)} capitalize`}>
              {task.priority}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {task.description && (
          <p className="text-gray-400 text-sm line-clamp-3">
            {task.description}
          </p>
        )}

        <div className="flex items-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span>
              {task.assigned_to ? 'Assigned' : 'Unassigned'}
            </span>
          </div>
          
          {task.estimated_hours && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{task.estimated_hours}h estimated</span>
            </div>
          )}

          <Badge variant="secondary" className="text-xs bg-purple-500/20 text-purple-400">
            {task.task_type}
          </Badge>
        </div>

        {showActions && (
          <div className="flex gap-2 pt-2">
            {task.status !== 'completed' && onStatusChange && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onStatusChange(task.id, task.status === 'todo' ? 'in_progress' : 'completed')}
                className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
              >
                {task.status === 'todo' ? 'Start' : 'Complete'}
              </Button>
            )}
            
            {!task.assigned_to && onAssign && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAssign(task.id)}
                className="border-green-500/50 text-green-400 hover:bg-green-500/10"
              >
                Assign
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskCard;
