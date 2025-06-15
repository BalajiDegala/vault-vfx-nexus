
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// Strictly type EVERYTHING as any to avoid TS excessive type recursion.
export const useProjectTasks = (studioId: any): any => {
  const [projects, setProjects] = useState<any>([]);
  const [tasksByProject, setTasksByProject] = useState<any>({});
  const [loading, setLoading] = useState<any>(false);

  useEffect(() => {
    if (!studioId) return;
    fetchStudioProjectsAndTasks();
    // eslint-disable-next-line
  }, [studioId]);

  // All data, args, and returns are explicitly "any"
  const fetchStudioProjectsAndTasks = async (): Promise<any> => {
    setLoading(true);

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
      return undefined as any;
    }
    setProjects(projectsData);

    // All types in this result are also just treated as any
    const tasksResult: any = {};
    for (let i = 0; i < projectsData.length; i++) {
      const project: any = projectsData[i];
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

  // Return is fully forced to any, so nothing is inferred
  return { projects, tasksByProject, loading, refetch: fetchStudioProjectsAndTasks } as any;
};
