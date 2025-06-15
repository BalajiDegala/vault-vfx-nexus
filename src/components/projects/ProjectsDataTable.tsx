
import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import ProjectPipelineViewer from "./ProjectPipelineViewer";
import ProjectRow from "./ProjectRow";
import ProjectDeleteDialog from "./ProjectDeleteDialog";
import ProjectsTableHeader from "./ProjectsTableHeader";
import { useProjectActions } from "@/hooks/useProjectActions";

type Project = Database["public"]["Tables"]["projects"]["Row"];
type SortColumn = "title" | "status" | "budget" | "deadline" | "assigned_to" | "security_level" | "project_type";
type AppRole = Database["public"]["Enums"]["app_role"];

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
  onProjectUpdate?: () => void;
  userRole?: AppRole | null;
  userId?: string;
}

const ProjectsDataTable: React.FC<ProjectsDataTableProps> = ({
  loading, sortedProjects, sortColumn, sortDirection, handleSort,
  selectedProject, setSelectedProject, pipelineOpen, setPipelineOpen,
  statusColor,
  selectedIds, setSelectedIds, isAllOnPageSelected, isIndeterminate, pagedProjects,
  onSelectAllFiltered,
  selectAllActive,
  totalFilteredCount,
  onProjectUpdate,
  userRole,
  userId,
}) => {
  const {
    deleteDialogOpen,
    setDeleteDialogOpen,
    projectToDelete,
    deleting,
    handleDeleteClick,
    handleConfirmDelete,
    handleEditClick,
  } = useProjectActions();

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

  const handleSelectAllChange = () => {
    if (onSelectAllFiltered) {
      onSelectAllFiltered();
    } else {
      handleSelectAll(!isAllOnPageSelected);
    }
  };

  return (
    <>
      <Table>
        <TableCaption className="text-left px-4 py-2">All Projects ({sortedProjects.length})</TableCaption>
        <ProjectsTableHeader
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          handleSort={handleSort}
          selectAllActive={selectAllActive || false}
          isIndeterminate={isIndeterminate}
          onSelectAllChange={handleSelectAllChange}
          totalFilteredCount={totalFilteredCount}
          isAllOnPageSelected={isAllOnPageSelected}
        />
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
                onProjectUpdate={onProjectUpdate}
                userRole={userRole}
                userId={userId}
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

      <ProjectDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        project={projectToDelete}
        onConfirmDelete={handleConfirmDelete}
        deleting={deleting}
      />
    </>
  );
};

export default ProjectsDataTable;
