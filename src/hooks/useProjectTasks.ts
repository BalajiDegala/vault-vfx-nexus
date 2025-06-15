
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// This hook is intentionally fully type-agnostic to avoid TypeScript recursion/depth inference issues.
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

    // Fetch projects for this studio
    const { data: projectsData, error } = await supabase
      .from("projects")
      .select("id, title")
      .eq("client_id", studioId) as any;

    if (error || !projectsData) {
      setProjects([]);
      setTasksByProject({});
      setLoading(false);
      return;
    }
    setProjects(projectsData as any[]);

    const tasksResult: Record<string, any[]> = {};
    // Type everything inside this as any, too
    for (const project of projectsData as any[]) {
      const { data: tasks } = await supabase
        .from("tasks")
        .select("id, name, description, task_type, status, priority")
        .eq("project_id", project.id) as any;
      tasksResult[project.id] = (tasks ?? []) as any[];
    }
    setTasksByProject(tasksResult);
    setLoading(false);
    return undefined;
  };

  // Explicitly type return as any!
  return { projects, tasksByProject, loading, refetch: fetchStudioProjectsAndTasks } as any;
};
