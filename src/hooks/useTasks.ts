
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type Task = Database["public"]["Tables"]["tasks"]["Row"];

interface UseTasksResult {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  updateTaskStatus: (taskId: string, status: string) => Promise<void>;
  assignTask: (taskId: string, userId: string) => Promise<void>;
  createTask: (task: Partial<Task>) => Promise<void>;
  refetch: () => Promise<void>;
}

export const useTasks = (projectId?: string, shotId?: string): UseTasksResult => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase.from('tasks').select('*');
      
      if (shotId) {
        query = query.eq('shot_id', shotId);
      } else if (projectId) {
        // Fetch tasks for all shots in the project
        const { data: shots } = await supabase
          .from('shots')
          .select('id')
          .in('sequence_id', [projectId]); // This would need adjustment for proper hierarchy
        
        if (shots && shots.length > 0) {
          const shotIds = shots.map(shot => shot.id);
          query = query.in('shot_id', shotIds);
        }
      }

      const { data, error: fetchError } = await query.order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setTasks(data || []);
    } catch (err: any) {
      console.error('Error fetching tasks:', err);
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, status } : task
        )
      );

      toast({
        title: "Success",
        description: "Task status updated successfully",
      });
    } catch (err: any) {
      console.error('Error updating task status:', err);
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive"
      });
    }
  };

  const assignTask = async (taskId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ assigned_to: userId, updated_at: new Date().toISOString() })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, assigned_to: userId } : task
        )
      );

      toast({
        title: "Success",
        description: "Task assigned successfully",
      });
    } catch (err: any) {
      console.error('Error assigning task:', err);
      toast({
        title: "Error",
        description: "Failed to assign task",
        variant: "destructive"
      });
    }
  };

  const createTask = async (taskData: Partial<Task>) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([taskData])
        .select()
        .single();

      if (error) throw error;

      setTasks(prevTasks => [data, ...prevTasks]);

      toast({
        title: "Success",
        description: "Task created successfully",
      });
    } catch (err: any) {
      console.error('Error creating task:', err);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId, shotId]);

  return {
    tasks,
    loading,
    error,
    updateTaskStatus,
    assignTask,
    createTask,
    refetch: fetchTasks
  };
};
