
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Share2, Eye, Clock, User } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import CreateTaskModal from "@/components/tasks/CreateTaskModal";
import TaskCard from "@/components/tasks/TaskCard";
import { useTasks } from "@/hooks/useTasks";

type Shot = Database["public"]["Tables"]["shots"]["Row"];
type Task = Database["public"]["Tables"]["tasks"]["Row"];

interface ShotTasksViewProps {
  shot: Shot;
  userRole?: string;
  onShareTask?: (taskId: string) => void;
}

const ShotTasksView = ({ shot, userRole, onShareTask }: ShotTasksViewProps) => {
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const { tasks, loading, updateTaskStatus, assignTask, refetch } = useTasks(undefined, shot.id);

  const canCreateTasks = userRole === 'studio' || userRole === 'admin' || userRole === 'producer';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-500';
      case 'in_progress': return 'bg-blue-500';
      case 'review': return 'bg-orange-500';
      case 'approved': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const tasksByStatus = {
    todo: tasks.filter(t => t.status === 'todo'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    review: tasks.filter(t => t.status === 'review'),
    completed: tasks.filter(t => t.status === 'completed')
  };

  return (
    <div className="space-y-6">
      {/* Shot Header */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white text-xl">{shot.name}</CardTitle>
              <div className="flex items-center gap-4 mt-2">
                <Badge className={`${getStatusColor(shot.status)} text-white`}>
                  {shot.status}
                </Badge>
                <span className="text-gray-400 text-sm">
                  Frames: {shot.frame_start} - {shot.frame_end}
                </span>
                {shot.assigned_to && (
                  <div className="flex items-center gap-1 text-gray-400 text-sm">
                    <User className="h-3 w-3" />
                    Assigned
                  </div>
                )}
              </div>
            </div>
            
            {canCreateTasks && (
              <Button
                onClick={() => setShowCreateTaskModal(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            )}
          </div>
        </CardHeader>

        {shot.description && (
          <CardContent>
            <p className="text-gray-300">{shot.description}</p>
          </CardContent>
        )}
      </Card>

      {/* Tasks Overview */}
      <div className="grid grid-cols-4 gap-4">
        {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
          <Card key={status} className="bg-gray-900/50 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm font-medium">
                {status.replace('_', ' ').toUpperCase()} ({statusTasks.length})
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Tasks List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          <span className="ml-2 text-gray-400">Loading tasks...</span>
        </div>
      ) : tasks.length === 0 ? (
        <Card className="bg-gray-900/50 border-gray-700">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Clock className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Tasks Yet</h3>
            <p className="text-gray-400 text-center max-w-md mb-4">
              Create tasks for this shot to start organizing the work pipeline.
            </p>
            {canCreateTasks && (
              <Button
                onClick={() => setShowCreateTaskModal(true)}
                variant="outline"
                className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Task
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <div key={task.id} className="relative">
              <TaskCard
                task={task}
                onStatusChange={updateTaskStatus}
                onAssign={assignTask}
                showActions={canCreateTasks}
              />
              
              {/* Share Task Button */}
              {canCreateTasks && onShareTask && (
                <div className="absolute top-2 right-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onShareTask(task.id)}
                    className="h-8 w-8 p-0 bg-gray-800/80 hover:bg-gray-700"
                  >
                    <Share2 className="h-3 w-3 text-blue-400" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={showCreateTaskModal}
        onClose={() => {
          setShowCreateTaskModal(false);
          refetch();
        }}
        shotId={shot.id}
        shotName={shot.name}
      />
    </div>
  );
};

export default ShotTasksView;
