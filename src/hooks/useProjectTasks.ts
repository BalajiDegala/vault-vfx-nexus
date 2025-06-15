
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// Completely type-agnostic to avoid recursion/deep inference
export const useProjectTasks = (studioId: any): any => {
  // State fully typed as any
  const [projects, setProjects] = useState<any>([]);
  const [tasksByProject, setTasksByProject] = useState<any>({});
  const [loading, setLoading] = useState<any>(false);

  useEffect(() => {
    if (!studioId) return;
    fetchStudioProjectsAndTasks();
    // eslint-disable-next-line
  }, [studioId]);

  // All function args/results/state are typed as any
  const fetchStudioProjectsAndTasks = async (): Promise<any> => {
    setLoading(true);

    // Get projects for this studio, cast all results to any
    const fetchProjects: any = await supabase
      .from("projects")
      .select("id, title")
      .eq("client_id", studioId);
    const projectsData: any = fetchProjects && fetchProjects.data ? fetchProjects.data : [];
    const error: any = fetchProjects && fetchProjects.error ? fetchProjects.error : null;

    if (error || !projectsData) {
      setProjects([]);
      setTasksByProject({});
      setLoading(false);
      return;
    }
    setProjects(projectsData);

    const tasksResult: any = {};
    for (const project of projectsData as any[]) {
      const fetchTasks: any = await supabase
        .from("tasks")
        .select("id, name, description, task_type, status, priority")
        .eq("project_id", project.id);
      const tasks: any = fetchTasks && fetchTasks.data ? fetchTasks.data : [];
      tasksResult[project.id] = tasks;
    }
    setTasksByProject(tasksResult);
    setLoading(false);
    return undefined as any;
  };

  // Return is forced to any
  return { projects, tasksByProject, loading, refetch: fetchStudioProjectsAndTasks } as any;
};
