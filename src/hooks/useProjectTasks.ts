
// @ts-nocheck
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches studio projects and tasks and disables all type inference by using any everywhere.
 * This avoids TypeScript "excessively deep and possibly infinite" instantiation.
 */
export default function useProjectTasks(studioId: any): any {
  const [projects, setProjects] = useState<any>([]);
  const [tasksByProject, setTasksByProject] = useState<any>({});
  const [loading, setLoading] = useState<any>(false);

  useEffect(() => {
    if (!studioId) return;
    fetchStudioProjectsAndTasks();
    // eslint-disable-next-line
  }, [studioId]);

  const fetchStudioProjectsAndTasks = async (): Promise<any> => {
    setLoading(true as any);

    const fetchProjects: any = await supabase
      .from("projects")
      .select("id, title")
      .eq("client_id", studioId);

    const projectsData: any = fetchProjects && fetchProjects.data ? fetchProjects.data : [];
    const error: any = fetchProjects && fetchProjects.error ? fetchProjects.error : null;

    if (error || !projectsData) {
      setProjects([] as any);
      setTasksByProject({} as any);
      setLoading(false as any);
      return undefined as any;
    }
    setProjects(projectsData as any);

    const tasksResult: any = {};
    for (let i = 0; i < (projectsData as any).length; i++) {
      const project: any = (projectsData as any)[i];
      const fetchTasks: any = await supabase
        .from("tasks")
        .select("id, name, description, task_type, status, priority")
        .eq("project_id", (project as any).id);
      const tasks: any = fetchTasks && fetchTasks.data ? fetchTasks.data : [];
      tasksResult[(project as any).id as any] = tasks as any;
    }
    setTasksByProject(tasksResult as any);
    setLoading(false as any);
    return undefined as any;
  };

  const result: any = {
    projects: projects as any,
    tasksByProject: tasksByProject as any,
    loading: loading as any,
    refetch: fetchStudioProjectsAndTasks as any,
  };
  return result as any;
}
