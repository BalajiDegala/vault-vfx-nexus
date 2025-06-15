
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// Fully type-agnostic version to prevent TS deep type recursion
export const useProjectTasks = (studioId: any): any => {
  // State hooks forced to any
  const [projects, setProjects] = useState<any>([]);
  const [tasksByProject, setTasksByProject] = useState<any>({});
  const [loading, setLoading] = useState<any>(false);

  useEffect(() => {
    if (!studioId) return;
    fetchStudioProjectsAndTasks();
    // eslint-disable-next-line
  }, [studioId]);

  // Explicitly state function type as any
  const fetchStudioProjectsAndTasks: any = async (): Promise<any> => {
    setLoading(true);

    // All Supabase results and values are explicitly any
    const fetchProjects: any = await supabase
      .from("projects")
      .select("id, title")
      .eq("client_id", studioId);

    // Type as any
    const projectsData: any = fetchProjects && fetchProjects.data ? fetchProjects.data : [];
    const error: any = fetchProjects && fetchProjects.error ? fetchProjects.error : null;

    if (error || !projectsData) {
      setProjects([] as any);
      setTasksByProject({} as any);
      setLoading(false as any);
      return undefined as any;
    }
    setProjects(projectsData as any);

    // Collect tasks for each project, typed as any
    const tasksResult: any = {};
    for (let i = 0; i < (projectsData as any).length; i++) {
      const project: any = (projectsData as any)[i];
      const fetchTasks: any = await supabase
        .from("tasks")
        .select("id, name, description, task_type, status, priority")
        .eq("project_id", project.id);
      const tasks: any = fetchTasks && fetchTasks.data ? fetchTasks.data : [];
      tasksResult[project.id as any] = tasks as any;
    }
    setTasksByProject(tasksResult as any);
    setLoading(false as any);
    return undefined as any;
  };

  // Return is explicitly and redundantly cast to any
  return {
    projects: projects as any,
    tasksByProject: tasksByProject as any,
    loading: loading as any,
    refetch: fetchStudioProjectsAndTasks as any,
  } as any;
};
