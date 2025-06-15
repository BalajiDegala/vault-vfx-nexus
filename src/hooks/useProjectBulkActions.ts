
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type Project = Database["public"]["Tables"]["projects"]["Row"];
type ProjectStatus = Database["public"]["Enums"]["project_status"];

export const useProjectBulkActions = (
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>,
  selectedIds: string[],
  onDeselectAll: () => void
) => {
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const { toast } = useToast();

  const handleBulkStatusChange = async (status: ProjectStatus) => {
    if (selectedIds.length === 0) return;
    
    setBulkActionLoading(true);
    try {
      const { error } = await supabase
        .from("projects")
        .update({ status })
        .in("id", selectedIds);
        
      if (!error) {
        setProjects((prev) =>
          prev.map((p) =>
            selectedIds.includes(p.id) ? { ...p, status } : p
          )
        );
        onDeselectAll();
        toast({
          title: "Status Updated",
          description: `Successfully updated ${selectedIds.length} projects to "${status}".`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update project status.",
          variant: "destructive",
        });
      }
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    
    setBulkActionLoading(true);
    try {
      const { error } = await supabase.from("projects").delete().in("id", selectedIds);
      if (!error) {
        setProjects((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
        onDeselectAll();
        toast({
          title: "Projects Deleted",
          description: `Successfully deleted ${selectedIds.length} projects.`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete projects.",
          variant: "destructive",
        });
      }
    } finally {
      setBulkActionLoading(false);
    }
  };

  return {
    bulkActionLoading,
    handleBulkStatusChange,
    handleBulkDelete
  };
};
