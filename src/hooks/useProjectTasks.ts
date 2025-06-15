
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type Project = Pick<Database["public"]["Tables"]["projects"]["Row"], "id" | "title">;
type Task = Database["public"]["Tables"]["tasks"]["Row"];

interface UseProjectTasksResult {
  projects: Project[];
  tasksByProject: Record<string, Task[]>;
  loading: boolean;
  refetch: () => Promise<void>;
}

export default function useProjectTasks(studioId: string | undefined): UseProjectTasksResult {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasksByProject, setTasksByProject] = useState<Record<string, Task[]>>({});
  const [loading, setLoading] = useState<boolean>(false);

  const fetchStudioProjectsAndTasks = useCallback(async (): Promise<void> => {
    if (!studioId) {
      setProjects([]);
      setTasksByProject({});
      return;
    }
    setLoading(true);

    const { data: projectsWithHierarchy, error } = await supabase
      .from('projects')
      .select(`
        id, 
        title,
        sequences:sequences (
          id,
          shots:shots (
            id,
            tasks:tasks!inner(
              id, name, description, task_type, status, priority, shot_id
            )
          )
        )
      `)
      .eq('client_id', studioId);

    if (error) {
      console.error("Error fetching projects and tasks:", error);
      setProjects([]);
      setTasksByProject({});
      setLoading(false);
      return;
    }

    if (!projectsWithHierarchy) {
      setProjects([]);
      setTasksByProject({});
      setLoading(false);
      return;
    }

    const processedProjects: Project[] = projectsWithHierarchy.map(p => ({ id: p.id, title: p.title || '' }));
    const processedTasksByProject: Record<string, Task[]> = {};

    for (const project of projectsWithHierarchy) {
      // The "any" type is used here because Supabase's nested select types can be complex.
      // This is a controlled use to process the fetched hierarchy.
      const allTasks: Task[] = project.sequences.flatMap((seq: any) => 
        (seq.shots || []).flatMap((shot: any) => shot.tasks || [])
      );
      processedTasksByProject[project.id] = allTasks;
    }
    
    setProjects(processedProjects);
    setTasksByProject(processedTasksByProject);
    setLoading(false);
  }, [studioId]);

  useEffect(() => {
    fetchStudioProjectsAndTasks();
  }, [fetchStudioProjectsAndTasks]);

  return {
    projects,
    tasksByProject,
    loading,
    refetch: fetchStudioProjectsAndTasks,
  };
}
