
import logger from "@/lib/logger";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type Project = Database["public"]["Tables"]["projects"]["Row"];

interface ProjectStats {
  totalProjects: number;
  openProjects: number;
  avgBudget: number;
  activeArtists: number;
}

export const useProjectsData = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ProjectStats>({
    totalProjects: 0,
    openProjects: 0,
    avgBudget: 0,
    activeArtists: 0
  });
  const { toast } = useToast();

  const fetchProjects = async () => {
    try {
      setLoading(true);
      logger.log("Fetching projects...");
      
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching projects:", error);
        throw error;
      }
      
      logger.log("Projects fetched successfully:", data?.length || 0);
      setProjects(data || []);
    } catch (error: any) {
      console.error("Error fetching projects:", error);
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Get total projects count
      const { count: totalProjects } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true });

      // Get open projects count
      const { count: openProjects } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .eq("status", "open");

      // Get average budget
      const { data: budgetData } = await supabase
        .from("projects")
        .select("budget_min, budget_max")
        .not("budget_min", "is", null)
        .not("budget_max", "is", null);

      let avgBudget = 0;
      if (budgetData && budgetData.length > 0) {
        const totalBudget = budgetData.reduce((sum, project) => {
          return sum + ((project.budget_min || 0) + (project.budget_max || 0)) / 2;
        }, 0);
        avgBudget = totalBudget / budgetData.length;
      }

      // Get active artists count (users with artist role)
      const { count: activeArtists } = await supabase
        .from("user_roles")
        .select("*", { count: "exact", head: true })
        .eq("role", "artist");

      setStats({
        totalProjects: totalProjects || 0,
        openProjects: openProjects || 0,
        avgBudget: Math.round(avgBudget),
        activeArtists: activeArtists || 0
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleProjectUpdate = () => {
    logger.log("Updating projects list...");
    fetchProjects();
    fetchStats();
  };

  useEffect(() => {
    fetchProjects();
    fetchStats();
  }, []);

  return {
    projects,
    loading,
    stats,
    handleProjectUpdate
  };
};
