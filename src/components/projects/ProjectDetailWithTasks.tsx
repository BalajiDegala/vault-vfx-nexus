
import logger from "@/lib/logger";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Database } from "@/integrations/supabase/types";
import ShotsListEnhanced from "./ShotsListEnhanced";
import TaskSharingModal from "../tasks/TaskSharingModal";
import { useToast } from "@/hooks/use-toast";

type Project = Database["public"]["Tables"]["projects"]["Row"];
type Sequence = Database["public"]["Tables"]["sequences"]["Row"];

interface ProjectDetailWithTasksProps {
  project: Project;
  user: User;
  userRole: string;
}

const ProjectDetailWithTasks = ({ project, user, userRole }: ProjectDetailWithTasksProps) => {
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchSequences();
  }, [project.id, userRole, user.id]);

  const fetchSequences = async () => {
    try {
      logger.log('🔍 Fetching sequences for project:', project.id, 'userRole:', userRole);
      
      if (userRole === 'artist') {
        // For artists, only show sequences that have tasks shared with them
        const { data: sharedTasks, error: sharedError } = await supabase
          .from('shared_tasks')
          .select(`
            task_id,
            status,
            tasks!inner (
              id,
              shot_id,
              shots!inner (
                id,
                sequence_id,
                sequences!inner (
                  id,
                  name,
                  description,
                  status,
                  order_index,
                  project_id
                )
              )
            )
          `)
          .eq('artist_id', user.id)
          .eq('status', 'approved'); // Only show approved shared tasks

        if (sharedError) {
          logger.error('Error fetching shared tasks:', sharedError);
          setSequences([]);
          return;
        }

        // Extract unique sequences from shared tasks
        const uniqueSequences = new Map();
        sharedTasks?.forEach(sharedTask => {
          const sequence = sharedTask.tasks?.shots?.sequences;
          if (sequence && sequence.project_id === project.id) {
            uniqueSequences.set(sequence.id, sequence);
          }
        });

        const artistSequences = Array.from(uniqueSequences.values());
        logger.log('✅ Artist sequences with shared tasks:', artistSequences.length);
        setSequences(artistSequences);
      } else {
        // For studios/admins, show all sequences
        const { data, error } = await supabase
          .from("sequences")
          .select("*")
          .eq("project_id", project.id)
          .order('order_index');

        if (error) {
          logger.error('Error fetching sequences:', error);
          setSequences([]);
        } else {
          logger.log('✅ All sequences fetched:', data?.length || 0);
          setSequences(data || []);
        }
      }
    } catch (error) {
      logger.error('Unexpected error fetching sequences:', error);
      setSequences([]);
    } finally {
      setLoading(false);
    }
  };

  const handleShareTask = (taskId: string) => {
    logger.log('📤 Sharing task:', taskId);
    setSelectedTaskId(taskId);
  };

  const handleTaskShared = () => {
    toast({
      title: "Success",
      description: "Task has been shared with the artist",
    });
    setSelectedTaskId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
        <span className="ml-2 text-gray-400">Loading project tasks...</span>
      </div>
    );
  }

  if (sequences.length === 0) {
    return (
      <div className="text-center py-20">
        <h3 className="text-xl font-semibold text-white mb-4">
          {userRole === 'artist' ? 'No Assigned Work' : 'No Sequences Found'}
        </h3>
        <p className="text-gray-400">
          {userRole === 'artist' 
            ? 'You don\'t have any approved task assignments in this project yet.' 
            : 'No sequences have been created for this project yet.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">
          {userRole === 'artist' ? 'Your Assigned Work' : 'Project Pipeline'}
        </h2>
        <div className="text-sm text-gray-400">
          {sequences.length} sequence{sequences.length !== 1 ? 's' : ''} 
          {userRole === 'artist' ? ' with assigned tasks' : ' total'}
        </div>
      </div>

      <div className="space-y-4">
        {sequences.map((sequence) => (
          <div key={sequence.id} className="bg-gray-900/50 border border-gray-700 rounded-lg">
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">{sequence.name}</h3>
                  {sequence.description && (
                    <p className="text-gray-400 text-sm mt-1">{sequence.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                    {sequence.status}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <ShotsListEnhanced 
                sequenceId={sequence.id}
                userRole={userRole}
                userId={user.id}
                onShareTask={userRole !== 'artist' ? handleShareTask : undefined}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Task Sharing Modal */}
      {selectedTaskId && (
        <TaskSharingModal
          isOpen={true}
          onClose={() => setSelectedTaskId(null)}
          task={null} // Will be fetched in modal
          userRole={userRole}
          userId={user.id}
          taskId={selectedTaskId}
          onSuccess={handleTaskShared}
        />
      )}
    </div>
  );
};

export default ProjectDetailWithTasks;
