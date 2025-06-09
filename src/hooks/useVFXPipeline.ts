
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type Sequence = Database["public"]["Tables"]["sequences"]["Row"];
type Shot = Database["public"]["Tables"]["shots"]["Row"];
type Task = Database["public"]["Tables"]["tasks"]["Row"];

interface SequenceWithShots extends Sequence {
  shots: ShotWithTasks[];
}

interface ShotWithTasks extends Shot {
  tasks: TaskWithProfile[];
  assigned_profile?: {
    first_name: string;
    last_name: string;
  };
}

interface TaskWithProfile extends Task {
  assigned_profile?: {
    first_name: string;
    last_name: string;
  };
}

export const useVFXPipeline = (projectId: string) => {
  const [sequences, setSequences] = useState<SequenceWithShots[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPipelineData = async () => {
    if (!projectId) return;

    try {
      // Fetch sequences with nested shots and tasks
      const { data: sequencesData, error: sequencesError } = await supabase
        .from('sequences')
        .select(`
          *,
          shots (
            *,
            assigned_profile:assigned_to (
              first_name,
              last_name
            ),
            tasks (
              *,
              assigned_profile:assigned_to (
                first_name,
                last_name
              )
            )
          )
        `)
        .eq('project_id', projectId)
        .order('order_index', { ascending: true });

      if (sequencesError) throw sequencesError;

      // Sort shots by frame_start and tasks by priority
      const processedSequences = (sequencesData || []).map(sequence => ({
        ...sequence,
        shots: (sequence.shots || [])
          .sort((a, b) => a.frame_start - b.frame_start)
          .map(shot => ({
            ...shot,
            tasks: (shot.tasks || []).sort((a, b) => {
              const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
              return priorityOrder[b.priority as keyof typeof priorityOrder] - 
                     priorityOrder[a.priority as keyof typeof priorityOrder];
            })
          }))
      }));

      setSequences(processedSequences);
    } catch (error) {
      console.error('Error fetching pipeline data:', error);
      toast({
        title: "Error",
        description: "Failed to load project structure",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPipelineData();
  }, [projectId]);

  const createSequence = async (data: { name: string; description?: string }) => {
    try {
      const maxOrder = Math.max(...sequences.map(s => s.order_index), 0);
      
      const { data: newSequence, error } = await supabase
        .from('sequences')
        .insert({
          project_id: projectId,
          name: data.name,
          description: data.description,
          order_index: maxOrder + 1,
        })
        .select()
        .single();

      if (error) throw error;

      const sequenceWithShots = { ...newSequence, shots: [] };
      setSequences(prev => [...prev, sequenceWithShots]);
      
      toast({ title: "Sequence created successfully" });
      return newSequence;
    } catch (error) {
      console.error('Error creating sequence:', error);
      toast({
        title: "Error",
        description: "Failed to create sequence",
        variant: "destructive",
      });
    }
  };

  const createShot = async (sequenceId: string, data: { name: string; description?: string; frame_start: number; frame_end: number }) => {
    try {
      const { data: newShot, error } = await supabase
        .from('shots')
        .insert({
          sequence_id: sequenceId,
          name: data.name,
          description: data.description,
          frame_start: data.frame_start,
          frame_end: data.frame_end,
        })
        .select()
        .single();

      if (error) throw error;

      const shotWithTasks = { ...newShot, tasks: [] };
      setSequences(prev => prev.map(seq => 
        seq.id === sequenceId 
          ? { ...seq, shots: [...seq.shots, shotWithTasks] }
          : seq
      ));
      
      toast({ title: "Shot created successfully" });
      return newShot;
    } catch (error) {
      console.error('Error creating shot:', error);
      toast({
        title: "Error",
        description: "Failed to create shot",
        variant: "destructive",
      });
    }
  };

  const createTask = async (shotId: string, data: { 
    name: string; 
    description?: string; 
    task_type: string; 
    priority: string; 
    estimated_hours?: number 
  }) => {
    try {
      const { data: newTask, error } = await supabase
        .from('tasks')
        .insert({
          shot_id: shotId,
          name: data.name,
          description: data.description,
          task_type: data.task_type,
          priority: data.priority,
          estimated_hours: data.estimated_hours,
        })
        .select()
        .single();

      if (error) throw error;

      setSequences(prev => prev.map(seq => ({
        ...seq,
        shots: seq.shots.map(shot => 
          shot.id === shotId 
            ? { ...shot, tasks: [...shot.tasks, newTask] }
            : shot
        )
      })));
      
      toast({ title: "Task created successfully" });
      return newTask;
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
    }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status })
        .eq('id', taskId);

      if (error) throw error;

      setSequences(prev => prev.map(seq => ({
        ...seq,
        shots: seq.shots.map(shot => ({
          ...shot,
          tasks: shot.tasks.map(task => 
            task.id === taskId ? { ...task, status } : task
          )
        }))
      })));
      
      toast({ title: "Task status updated" });
    } catch (error) {
      console.error('Error updating task status:', error);
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    }
  };

  return {
    sequences,
    loading,
    createSequence,
    createShot,
    createTask,
    updateTaskStatus,
    refetch: fetchPipelineData,
  };
};
