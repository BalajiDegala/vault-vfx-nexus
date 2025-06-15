
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useProjectTasks = (studioId: string) => {
  const [projects, setProjects] = useState<any[]>([]);
  const [tasksByProject, setTasksByProject] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!studioId) return;
    fetchStudioProjectsAndTasks();
    // eslint-disable-next-line
  }, [studioId]);

  const fetchStudioProjectsAndTasks = async () => {
    setLoading(true);
    // 1. Get all projects where client_id = studioId
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
    setProjects(projectsData);

    // 2. For each project, get tasks
    const tasksResult: Record<string, any[]> = {};
    for (const project of projectsData) {
      const { data: tasks } = await supabase
        .from("tasks")
        .select("id, name, description, task_type, status, priority")
        .eq("project_id", project.id);
      tasksResult[project.id] = tasks || [];
    }
    setTasksByProject(tasksResult);
    setLoading(false);
  };

  return { projects, tasksByProject, loading, refetch: fetchStudioProjectsAndTasks };
};
