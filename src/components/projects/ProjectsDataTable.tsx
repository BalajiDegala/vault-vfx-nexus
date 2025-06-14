
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, ArrowUp, ArrowDown, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Database } from "@/integrations/supabase/types";
import ProjectPipelineViewer from "./ProjectPipelineViewer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Project = Database["public"]["Tables"]["projects"]["Row"];
type SortColumn = "title" | "status" | "budget" | "deadline" | "assigned_to" | "security_level" | "project_type";

interface ProjectsDataTableProps {
  loading: boolean;
  sortedProjects: Project[];
  sortColumn: SortColumn;
  sortDirection: "asc" | "desc";
  handleSort: (col: SortColumn) => void;
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
  pipelineOpen: boolean;
  setPipelineOpen: (open: boolean) => void;
  statusColor: Record<string, string>;
}

const ProjectsDataTable: React.FC<ProjectsDataTableProps> = ({
  loading, sortedProjects, sortColumn, sortDirection, handleSort,
  selectedProject, setSelectedProject, pipelineOpen, setPipelineOpen,
  statusColor
}) => {
  const { toast } = useToast();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Handler for Delete action
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
      // Optionally, you can add logic here to refresh the list externally
      window.location.reload(); // force refresh to show removal, or better: lift up state and refresh
    } else {
      toast({
        title: "Error",
        description: "There was an error deleting the project.",
        variant: "destructive",
      });
    }
  };

  // Handler for Edit action (for now just an alert)
  const handleEditClick = (project: Project) => {
    // TODO: Implement actual editing modal, for now just alert
    toast({
      title: "Edit Project",
      description: `You clicked Edit for "${project.title}".`,
    });
  };

  return (
    <>
      <Table>
        <TableCaption className="text-left px-4 py-2">All Projects ({sortedProjects.length})</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="cursor-pointer select-none" onClick={() => handleSort("title")}>
              Title
              {sortColumn === "title" && (sortDirection === "asc" ? <ArrowUp className="inline ml-1 w-4 h-4" /> : <ArrowDown className="inline ml-1 w-4 h-4" />)}
            </TableHead>
            <TableHead className="cursor-pointer select-none" onClick={() => handleSort("status")}>
              Status
              {sortColumn === "status" && (sortDirection === "asc" ? <ArrowUp className="inline ml-1 w-4 h-4" /> : <ArrowDown className="inline ml-1 w-4 h-4" />)}
            </TableHead>
            <TableHead className="cursor-pointer select-none" onClick={() => handleSort("budget")}>
              Budget
              {sortColumn === "budget" && (sortDirection === "asc" ? <ArrowUp className="inline ml-1 w-4 h-4" /> : <ArrowDown className="inline ml-1 w-4 h-4" />)}
            </TableHead>
            <TableHead className="cursor-pointer select-none" onClick={() => handleSort("deadline")}>
              Deadline
              {sortColumn === "deadline" && (sortDirection === "asc" ? <ArrowUp className="inline ml-1 w-4 h-4" /> : <ArrowDown className="inline ml-1 w-4 h-4" />)}
            </TableHead>
            <TableHead className="cursor-pointer select-none" onClick={() => handleSort("assigned_to")}>
              Assigned To
              {sortColumn === "assigned_to" && (sortDirection === "asc" ? <ArrowUp className="inline ml-1 w-4 h-4" /> : <ArrowDown className="inline ml-1 w-4 h-4" />)}
            </TableHead>
            <TableHead className="cursor-pointer select-none" onClick={() => handleSort("security_level")}>
              Security Level
              {sortColumn === "security_level" && (sortDirection === "asc" ? <ArrowUp className="inline ml-1 w-4 h-4" /> : <ArrowDown className="inline ml-1 w-4 h-4" />)}
            </TableHead>
            <TableHead className="cursor-pointer select-none" onClick={() => handleSort("project_type")}>
              Type
              {sortColumn === "project_type" && (sortDirection === "asc" ? <ArrowUp className="inline ml-1 w-4 h-4" /> : <ArrowDown className="inline ml-1 w-4 h-4" />)}
            </TableHead>
            <TableHead>
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center">
                <Loader2 className="inline-block animate-spin text-blue-400 mx-1" />
                Loading projects...
              </TableCell>
            </TableRow>
          ) : sortedProjects.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-gray-400">
                No projects found.
              </TableCell>
            </TableRow>
          ) : (
            sortedProjects.map((project) => (
              <TableRow
                key={project.id}
                className="hover:bg-gray-800/50 transition-colors cursor-pointer"
                onClick={() => {
                  // Only open pipeline if not clicking actions buttons
                  if ((window as any)._actionClick) {
                    (window as any)._actionClick = false;
                    return;
                  }
                  setSelectedProject(project);
                  setPipelineOpen(true);
                }}
              >
                <TableCell className="font-medium text-white">{project.title}</TableCell>
                <TableCell>
                  <Badge className={statusColor[project.status ?? "draft"] ?? "bg-gray-500/20 text-gray-400"}>
                    {project.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {project.budget_min && project.budget_max
                    ? `${project.budget_min}–${project.budget_max} ${project.currency ?? "V3C"}`
                    : "—"}
                </TableCell>
                <TableCell>
                  {project.deadline ? new Date(project.deadline).toLocaleDateString() : "—"}
                </TableCell>
                <TableCell>
                  {project.assigned_to
                    ? <span className="text-blue-300">Assigned</span>
                    : <span className="text-gray-400">Unassigned</span>}
                </TableCell>
                <TableCell>{project.security_level ?? "Standard"}</TableCell>
                <TableCell className="capitalize">{project.project_type ?? "studio"}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Edit ${project.title}`}
                      onClick={e => {
                        e.stopPropagation();
                        (window as any)._actionClick = true;
                        handleEditClick(project);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete ${project.title}`}
                      onClick={e => {
                        e.stopPropagation();
                        (window as any)._actionClick = true;
                        handleDeleteClick(project);
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <ProjectPipelineViewer
        project={selectedProject}
        open={pipelineOpen}
        onOpenChange={setPipelineOpen}
      />

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to delete <b>{projectToDelete?.title}</b>? This action cannot be undone.
          </DialogDescription>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleting}
            >
              {deleting ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProjectsDataTable;
