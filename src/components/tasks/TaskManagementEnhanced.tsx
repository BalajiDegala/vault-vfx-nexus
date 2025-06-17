
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { Database } from "@/integrations/supabase/types";
import { useSharedTasksWithProjects } from "@/hooks/useSharedTasksWithProjects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  PlayCircle, 
  PauseCircle,
  Folder,
  Video,
  Camera,
  Task as TaskIcon,
  ArrowRight,
  AlertCircle
} from "lucide-react";

type AppRole = Database["public"]["Enums"]["app_role"];

interface TaskManagementEnhancedProps {
  userRole?: AppRole;
  userId: string;
}

const TaskManagementEnhanced = ({ userRole, userId }: TaskManagementEnhancedProps) => {
  const { sharedTasks, loading, refetch } = useSharedTasksWithProjects(userRole || "artist", userId);

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
      case "pending": return "bg-orange-500";
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const groupedTasks = sharedTasks.reduce((acc, sharedTask) => {
    const task = sharedTask.tasks;
    if (!task?.shots?.sequences?.projects) return acc;
    
    const project = task.shots.sequences.projects;
    const projectKey = project.id;
    
    if (!acc[projectKey]) {
      acc[projectKey] = {
        project,
        sequences: {}
      };
    }
    
    const sequence = task.shots.sequences;
    const sequenceKey = sequence.id;
    
    if (!acc[projectKey].sequences[sequenceKey]) {
      acc[projectKey].sequences[sequenceKey] = {
        sequence,
        shots: {}
      };
    }
    
    const shot = task.shots;
    const shotKey = shot.id;
    
    if (!acc[projectKey].sequences[sequenceKey].shots[shotKey]) {
      acc[projectKey].sequences[sequenceKey].shots[shotKey] = {
        shot,
        tasks: []
      };
    }
    
    acc[projectKey].sequences[sequenceKey].shots[shotKey].tasks.push({
      ...task,
      sharedTaskInfo: sharedTask
    });
    
    return acc;
  }, {} as any);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-400">Loading your assignments...</span>
        </div>
      </div>
    );
  }

  if (sharedTasks.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-4">No Assigned Tasks</h3>
          <p className="text-gray-400">
            {userRole === "artist" 
              ? "You don't have any assigned tasks yet. Wait for studios to share tasks with you!" 
              : "You haven't shared any tasks yet. Go to your projects to share tasks with artists."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          {userRole === "artist" ? "My Assigned Tasks" : "Shared Tasks Management"}
        </h1>
        <p className="text-gray-400">
          {userRole === "artist" 
            ? "View and work on tasks assigned to you from various projects" 
            : "Manage tasks you've shared with artists"}
        </p>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedTasks).map(([projectId, projectData]: [string, any]) => (
          <Card key={projectId} className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Folder className="h-6 w-6 text-purple-400" />
                <div>
                  <CardTitle className="text-xl text-white">
                    {projectData.project.title}
                  </CardTitle>
                  {projectData.project.project_code && (
                    <p className="text-gray-400 text-sm">
                      Project Code: {projectData.project.project_code}
                    </p>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(projectData.sequences).map(([sequenceId, sequenceData]: [string, any]) => (
                  <div key={sequenceId} className="border border-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Video className="h-5 w-5 text-blue-400" />
                      <h3 className="text-lg font-semibold text-blue-400">
                        {sequenceData.sequence.name}
                      </h3>
                    </div>
                    
                    <div className="space-y-3">
                      {Object.entries(sequenceData.shots).map(([shotId, shotData]: [string, any]) => (
                        <div key={shotId} className="border border-gray-600 rounded-lg p-3 bg-gray-800/30">
                          <div className="flex items-center gap-2 mb-2">
                            <Camera className="h-4 w-4 text-green-400" />
                            <h4 className="font-medium text-green-400">
                              {shotData.shot.name}
                            </h4>
                            <span className="text-xs text-gray-400">
                              Frames {shotData.shot.frame_start}-{shotData.shot.frame_end}
                            </span>
                          </div>
                          
                          <div className="space-y-2">
                            {shotData.tasks.map((task: any) => (
                              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded border border-gray-600">
                                <div className="flex items-center gap-3">
                                  <TaskIcon className="h-4 w-4 text-orange-400" />
                                  <div>
                                    <h5 className="font-medium text-white">{task.name}</h5>
                                    <p className="text-sm text-gray-400">{task.description}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge variant="outline" className="text-xs">
                                        {task.task_type}
                                      </Badge>
                                      {task.estimated_hours && (
                                        <span className="text-xs text-gray-400">
                                          Est: {task.estimated_hours}h
                                        </span>
                                      )}
                                    </div>
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
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${
                                      task.sharedTaskInfo.status === 'approved' ? 'border-green-500 text-green-400' :
                                      task.sharedTaskInfo.status === 'pending' ? 'border-yellow-500 text-yellow-400' :
                                      'border-red-500 text-red-400'
                                    }`}
                                  >
                                    {task.sharedTaskInfo.status}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TaskManagementEnhanced;
