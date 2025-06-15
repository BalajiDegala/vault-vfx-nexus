
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type Project = Database["public"]["Tables"]["projects"]["Row"];

export const useProjectActions = () => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  const handleDeleteClick = (project: Project) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    
    setDeleting(true);
    const { error } = await supabase.from("projects").delete().eq("id", projectToDelete.id);
    setDeleting(false);
    setDeleteDialogOpen(false);
    setProjectToDelete(null);
    
    if (!error) {
      toast({
        title: "Project deleted",
        description: `The project "${projectToDelete.title}" has been deleted.`,
        variant: "default",
      });
      // Force refresh to show removal
      window.location.reload();
    } else {
      toast({
        title: "Error",
        description: "There was an error deleting the project.",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (project: Project) => {
    // TODO: Implement actual editing modal, for now just alert
    toast({
      title: "Edit Project",
      description: `You clicked Edit for "${project.title}".`,
    });
  };

  return {
    deleteDialogOpen,
    setDeleteDialogOpen,
    projectToDelete,
    deleting,
    handleDeleteClick,
    handleConfirmDelete,
    handleEditClick,
  };
};
