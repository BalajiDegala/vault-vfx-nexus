import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// Intentionally keep everything type-agnostic to avoid TS recursion issues.
export const useProjectTasks = (studioId: any): any => {
  const [projects, setProjects] = useState<any[]>([]);
  const [tasksByProject, setTasksByProject] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!studioId) return;
    fetchStudioProjectsAndTasks();
    // eslint-disable-next-line
  }, [studioId]);

  // All objects/arrays/functions/data are typed as 'any' to avoid TS recursion
  const fetchStudioProjectsAndTasks = async (): Promise<any> => {
    setLoading(true);

    // Fetch projects for this studio and immediately cast results as any[]
    const fetchProjects = await supabase
      .from("projects")
      .select("id, title")
      .eq("client_id", studioId);

    const projectsData: any[] = (fetchProjects && fetchProjects.data) ? (fetchProjects.data as any[]) : [];
    const error: any = fetchProjects && fetchProjects.error ? fetchProjects.error : null;

    if (error || !projectsData) {
      setProjects([]);
      setTasksByProject({});
      setLoading(false);
      return;
    }
    setProjects(projectsData);

    const tasksResult: Record<string, any[]> = {};
    for (const project of projectsData) {
      const fetchTasks = await supabase
        .from("tasks")
        .select("id, name, description, task_type, status, priority")
        .eq("project_id", project.id);

      const tasks: any[] = (fetchTasks && fetchTasks.data) ? (fetchTasks.data as any[]) : [];
      tasksResult[project.id] = tasks;
    }
    setTasksByProject(tasksResult);
    setLoading(false);
    return undefined;
  };

  // Explicitly type return as any!
  return { projects, tasksByProject, loading, refetch: fetchStudioProjectsAndTasks } as any;
};
