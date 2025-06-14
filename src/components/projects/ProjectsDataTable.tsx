import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, ArrowUp, ArrowDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Database } from "@/integrations/supabase/types";
import ProjectPipelineViewer from "./ProjectPipelineViewer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ProjectRow from "./ProjectRow";

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
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  isAllOnPageSelected: boolean;
  isIndeterminate: boolean;
  pagedProjects: Project[];
  onSelectAllFiltered?: () => void;
  selectAllActive?: boolean;
  totalFilteredCount?: number;
}
const ProjectsDataTable: React.FC<ProjectsDataTableProps> = ({
  loading, sortedProjects, sortColumn, sortDirection, handleSort,
  selectedProject, setSelectedProject, pipelineOpen, setPipelineOpen,
  statusColor,
  selectedIds, setSelectedIds, isAllOnPageSelected, isIndeterminate, pagedProjects,
  onSelectAllFiltered,
  selectAllActive,
  totalFilteredCount,
}) => {
  const { toast } = useToast();

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [projectToDelete, setProjectToDelete] = React.useState<Project | null>(null);
  const [deleting, setDeleting] = React.useState(false);

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

  // Select all handler for current page
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const toAdd = pagedProjects.map((p) => p.id).filter((id) => !selectedIds.includes(id));
      setSelectedIds([...selectedIds, ...toAdd]);
    } else {
      const toRemove = pagedProjects.map((p) => p.id);
      setSelectedIds(selectedIds.filter((id) => !toRemove.includes(id)));
    }
  };

  return (
    <>
      <Table>
        <TableCaption className="text-left px-4 py-2">All Projects ({sortedProjects.length})</TableCaption>
        <TableHeader>
          <TableRow>
            {/* Bulk selection checkbox header */}
            <TableHead className="w-8 text-center p-0">
              <input
                type="checkbox"
                aria-label="Select all"
                checked={selectAllActive}
                ref={input => {
                  if (input) input.indeterminate = isIndeterminate;
                }}
                onChange={e => {
                  if (onSelectAllFiltered) {
                    onSelectAllFiltered();
                  } else {
                    handleSelectAll(e.target.checked);
                  }
                }}
                className="accent-blue-500"
              />
              <span className="block text-[0.65rem] text-blue-300">
                {selectAllActive
                  ? `All ${totalFilteredCount} selected`
                  : isAllOnPageSelected
                  ? "All page"
                  : ""}
              </span>
            </TableHead>
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
              <TableCell colSpan={9} className="text-center">
                <Loader2 className="inline-block animate-spin text-blue-400 mx-1" />
                Loading projects...
              </TableCell>
            </TableRow>
          ) : sortedProjects.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-gray-400">
                No projects found.
              </TableCell>
            </TableRow>
          ) : (
            sortedProjects.map((project) => (
              <ProjectRow
                key={project.id}
                project={project}
                statusColor={statusColor}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                // Bulk selection
                isSelected={selectedIds.includes(project.id)}
                onSelectChange={checked => {
                  setSelectedIds(checked
                    ? [...selectedIds, project.id]
                    : selectedIds.filter(id => id !== project.id)
                  );
                }}
              />
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
