
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// This is intentionally type-agnostic to avoid TypeScript recursive/deep inference issues.
export const useProjectTasks = (studioId: string): any => {
  // Use 'any[]' for projects and 'Record<string, any[]>' for tasksByProject
  const [projects, setProjects] = useState<any[]>([]);
  const [tasksByProject, setTasksByProject] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!studioId) return;
    fetchStudioProjectsAndTasks();
    // eslint-disable-next-line
  }, [studioId]);

  // All objects/arrays are typed as 'any' to avoid TS recursion
  const fetchStudioProjectsAndTasks = async (): Promise<void> => {
    setLoading(true);
    // Fetch projects for this studio
    const { data: projectsData, error } = await supabase
      .from("projects")
      .select("id, title")
      .eq("client_id", studioId);
    if (error || !projectsData) {
      setProjects([]);
      setTasksByProject({});
      setLoading(false);
      return;
    }
    setProjects(projectsData as any[]);

    const tasksResult: Record<string, any[]> = {};
    for (const project of projectsData as any[]) {
      const { data: tasks } = await supabase
        .from("tasks")
        .select("id, name, description, task_type, status, priority")
        .eq("project_id", project.id);
      // Note the explicit 'as any[]' here
      tasksResult[project.id] = (tasks ?? []) as any[];
    }
    setTasksByProject(tasksResult);
    setLoading(false);
  };

  // Explicitly type return as any!
  return { projects, tasksByProject, loading, refetch: fetchStudioProjectsAndTasks } as any;
};
