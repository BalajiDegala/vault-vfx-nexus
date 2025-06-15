
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import ProjectsDataTable from "./ProjectsDataTable";
import ProjectsPagination from "./ProjectsPagination";
import ProjectsTableFiltersContainer from "./ProjectsTableFiltersContainer";
import ProjectsBulkActionsBar from "./ProjectsBulkActionsBar";
import { useProjectFilters } from "@/hooks/useProjectFilters";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import { useProjectSorting } from "@/hooks/useProjectSorting";
import { useProjectBulkActions } from "@/hooks/useProjectBulkActions";
import { useProjectStatuses } from "@/hooks/useProjectStatuses";

type Project = Database["public"]["Tables"]["projects"]["Row"];
type AppRole = Database["public"]["Enums"]["app_role"];

const statusOptions = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "completed", label: "Completed" },
  { value: "draft", label: "Draft" },
  { value: "cancelled", label: "Cancelled" },
  { value: "review", label: "Review" },
  { value: "in_progress", label: "In Progress" },
];

const typeOptions = [
  { value: "all", label: "All" },
  { value: "studio", label: "Studio" },
  { value: "personal", label: "Personal" },
  { value: "freelance", label: "Freelance" },
  { value: "test", label: "Test" },
];

interface ProjectsTableProps {
  userRole?: AppRole | null;
  userId?: string;
}

const ProjectsTable: React.FC<ProjectsTableProps> = ({ userRole, userId }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [pipelineOpen, setPipelineOpen] = useState(false);

  // Custom hooks for functionality
  const { getStatusColor } = useProjectStatuses();
  
  const {
    statusFilter,
    typeFilter,
    searchQuery,
    deadlineRange,
    filteredProjects,
    handleFiltersChange
  } = useProjectFilters(projects);

  const {
    sortColumn,
    sortDirection,
    currentPage,
    pageCount,
    sortedProjects,
    pagedProjects,
    handleSort,
    goToPage,
    pageNumbersArray,
    resetPage
  } = useProjectSorting(filteredProjects);

  const {
    selectedIds,
    setSelectedIds,
    selectAllActive,
    handleSelectAllFiltered,
    handleDeselectAll
  } = useBulkSelection(filteredProjects, currentPage);

  const {
    bulkActionLoading,
    handleBulkStatusChange,
    handleBulkAssignment,
    handleBulkDelete
  } = useProjectBulkActions(setProjects, selectedIds, handleDeselectAll);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("projects")
      .select("*");
    if (!error && data) setProjects(data);
    setLoading(false);
  };

  // Reset page when filters change
  useEffect(() => {
    resetPage();
  }, [statusFilter, typeFilter, searchQuery, deadlineRange, resetPage]);

  // Deselect when projects change
  useEffect(() => {
    handleDeselectAll();
  }, [projects]);

  // Create dynamic status color mapping using custom statuses
  const statusColor: Record<string, string> = {
    completed: "bg-blue-500/20 text-blue-400",
    open: "bg-green-500/20 text-green-400",
    draft: "bg-yellow-500/20 text-yellow-400",
    cancelled: "bg-red-500/20 text-red-400",
    review: "bg-cyan-500/20 text-cyan-400",
    in_progress: "bg-purple-500/20 text-purple-400",
  };

  const isAllOnPageSelected = pagedProjects.length > 0 && pagedProjects.every(p => selectedIds.includes(p.id));
  const isIndeterminate = selectedIds.length > 0 && !isAllOnPageSelected;
  const anySelected = selectedIds.length > 0;

  return (
    <div className="bg-gray-900/50 border border-gray-700 rounded-xl overflow-x-auto mb-8 p-4">
      <ProjectsTableFiltersContainer
        statusOptions={statusOptions}
        typeOptions={typeOptions}
        onChange={handleFiltersChange}
      />
      {anySelected && (
        <ProjectsBulkActionsBar
          selectedCount={selectedIds.length}
          onDelete={handleBulkDelete}
          onDeselectAll={handleDeselectAll}
          onBulkStatusChange={handleBulkStatusChange}
          onBulkAssignment={handleBulkAssignment}
          disabled={bulkActionLoading}
        />
      )}
      <ProjectsDataTable
        loading={loading}
        sortedProjects={pagedProjects}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        handleSort={handleSort}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        pipelineOpen={pipelineOpen}
        setPipelineOpen={setPipelineOpen}
        statusColor={statusColor}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        isAllOnPageSelected={isAllOnPageSelected}
        isIndeterminate={isIndeterminate}
        pagedProjects={pagedProjects}
        onSelectAllFiltered={handleSelectAllFiltered}
        selectAllActive={selectAllActive}
        totalFilteredCount={filteredProjects.length}
        onProjectUpdate={fetchProjects}
        userRole={userRole}
        userId={userId}
      />
      <ProjectsPagination
        pageCount={pageCount}
        currentPage={currentPage}
        goToPage={goToPage}
        pageNumbers={pageNumbersArray()}
      />
    </div>
  );
};

export default ProjectsTable;
