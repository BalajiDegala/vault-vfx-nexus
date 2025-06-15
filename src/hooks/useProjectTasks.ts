
// Simple, type-agnostic version to avoid TS depth errors
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// We're intentionally not using Supabase-generated types here to avoid recursive types
export const useProjectTasks = (studioId: string) => {
  // Use `any[]` for both projects and tasks to avoid type depth issues
  const [projects, setProjects] = useState<any[]>([]);
  const [tasksByProject, setTasksByProject] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!studioId) return;
    fetchStudioProjectsAndTasks();
    // eslint-disable-next-line
  }, [studioId]);

  // Explicitly type all returned objects as `any`
  const fetchStudioProjectsAndTasks = async () => {
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

    // For each project, fetch tasks (again, type as any)
    const tasksResult: Record<string, any[]> = {};
    for (const project of projectsData as any[]) {
      const { data: tasks } = await supabase
        .from("tasks")
        .select("id, name, description, task_type, status, priority")
        .eq("project_id", project.id);
      tasksResult[project.id] = (tasks ?? []) as any[];
    }
    setTasksByProject(tasksResult);
    setLoading(false);
  };

  return { projects, tasksByProject, loading, refetch: fetchStudioProjectsAndTasks };
};

