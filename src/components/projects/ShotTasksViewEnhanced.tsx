
import logger from "@/lib/logger";
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Database } from "@/integrations/supabase/types";
import { Plus, Share2, Clock, CheckCircle, PlayCircle, PauseCircle } from "lucide-react";
import CreateTaskModal from "../tasks/CreateTaskModal";

type Shot = Database["public"]["Tables"]["shots"]["Row"];
type Task = Database["public"]["Tables"]["tasks"]["Row"];

interface ShotTasksViewEnhancedProps {
  shot: Shot;
  userRole?: string;
  userId: string;
  onShareTask?: (taskId: string) => void;
}

interface TaskWithSharedInfo extends Task {
  shared_info?: {
    status: string;
    access_level: string;
    shared_at: string;
  };
}

export default function ShotTasksViewEnhanced({ 
  shot, 
  userRole, 
  userId,
  onShareTask 
}: ShotTasksViewEnhancedProps) {
  const [tasks, setTasks] = useState<TaskWithSharedInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [shot.id, userRole, userId]);

  const fetchTasks = async () => {
    try {
      logger.log('🔍 Fetching tasks for shot:', shot.id, 'userRole:', userRole);
      
      const query = supabase.from("tasks").select("*").eq("shot_id", shot.id);
      
      // For artists, also get shared task info
      if (userRole === 'artist') {
        const { data: tasksData, error: tasksError } = await query;
        
        if (tasksError) {
          console.error('Error fetching tasks:', tasksError);
          setTasks([]);
          return;
        }

        if (!tasksData || tasksData.length === 0) {
          setTasks([]);
          return;
        }

        // Get shared task information for these tasks
        const taskIds = tasksData.map(t => t.id);
        const { data: sharedData, error: sharedError } = await supabase
          .from("shared_tasks")
          .select("task_id, status, access_level, shared_at")
          .in("task_id", taskIds)
          .eq("artist_id", userId);

        if (sharedError) {
          console.error('Error fetching shared tasks:', sharedError);
        }

        // Combine tasks with shared info
        const tasksWithSharedInfo = tasksData.map(task => {
          const sharedInfo = sharedData?.find(s => s.task_id === task.id);
          return {
            ...task,
            shared_info: sharedInfo ? {
              status: sharedInfo.status,
              access_level: sharedInfo.access_level,
              shared_at: sharedInfo.shared_at
            } : undefined
          };
        });

        setTasks(tasksWithSharedInfo);
      } else {
        // For studios/admins, just get all tasks
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching tasks:', error);
          setTasks([]);
        } else {
          setTasks(data || []);
        }
      }
    } catch (error) {
      console.error('Unexpected error fetching tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = () => {
    logger.log('🎯 Opening create task modal for shot:', shot.id);
    setShowCreateModal(true);
  };

  const handleTaskCreated = () => {
    logger.log('✅ Task created, refreshing list');
    fetchTasks();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "in_progress": return <PlayCircle className="h-4 w-4" />;
      case "review": return <PauseCircle className="h-4 w-4" />;
      case "completed": return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_progress": return "bg-blue-500";
      case "review": return "bg-yellow-500";
      case "completed": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-500";
      case "high": return "bg-orange-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const canCreateTasks = userRole === 'studio' || userRole === 'admin' || userRole === 'producer';

  logger.log('🎯 ShotTasksViewEnhanced render - userRole:', userRole, 'canCreateTasks:', canCreateTasks);

  if (loading) {
    return <div className="text-gray-400">Loading tasks...</div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-200">
          {userRole === 'artist' ? 'Your Assigned Tasks' : 'Tasks'}
        </h4>
        {canCreateTasks && (
          <Button
            variant="outline"
            size="sm"
            className="border-green-500/50 text-green-400 hover:bg-green-500/10"
            onClick={handleCreateTask}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        )}
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-6 text-gray-400">
          {userRole === 'artist' ? 'No assigned tasks in this shot.' : 'No tasks created for this shot yet.'}
          {canCreateTasks && (
            <div className="mt-2">
              <Button
                variant="outline"
                className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                onClick={handleCreateTask}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Task
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <Card key={task.id} className="bg-gray-800/50 border-gray-600">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h5 className="font-medium text-white">{task.name}</h5>
                      <Badge variant="outline" className="text-xs">
                        {task.task_type}
                      </Badge>
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-gray-400 mb-2">{task.description}</p>
                    )}
                    
                    <div className="flex items-center gap-2">
                      {task.estimated_hours && (
                        <span className="text-xs text-gray-400">
                          Est: {task.estimated_hours}h
                        </span>
                      )}
                      {task.actual_hours && (
                        <span className="text-xs text-gray-400">
                          Actual: {task.actual_hours}h
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={`${getPriorityColor(task.priority)} text-white text-xs`}>
                      {task.priority}
                    </Badge>
                    <Badge className={`${getStatusColor(task.status)} text-white flex items-center gap-1`}>
                      {getStatusIcon(task.status)}
                      {task.status}
                    </Badge>
                    
                    {userRole === 'artist' && task.shared_info && (
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          task.shared_info.status === 'approved' ? 'border-green-500 text-green-400' :
                          task.shared_info.status === 'pending' ? 'border-yellow-500 text-yellow-400' :
                          'border-red-500 text-red-400'
                        }`}
                      >
                        {task.shared_info.status}
                      </Badge>
                    )}
                    
                    {(userRole === 'studio' || userRole === 'admin' || userRole === 'producer') && onShareTask && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onShareTask(task.id)}
                        className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateTaskModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        shotId={shot.id}
        shotName={shot.name}
        onSuccess={handleTaskCreated}
      />
    </div>
  );
}
