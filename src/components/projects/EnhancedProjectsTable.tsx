
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import ProjectsDataTable from "./ProjectsDataTable";
import ProjectsPagination from "./ProjectsPagination";
import ProjectsTableFiltersContainer from "./ProjectsTableFiltersContainer";
import ProjectsBulkActionsBar from "./ProjectsBulkActionsBar";
import { Button } from "@/components/ui/button";
import { Download, RotateCcw } from "lucide-react";
import { useProjectFilters } from "@/hooks/useProjectFilters";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import { useProjectSorting } from "@/hooks/useProjectSorting";
import { useProjectBulkActions } from "@/hooks/useProjectBulkActions";
import { useProjectStatuses } from "@/hooks/useProjectStatuses";
import { useToast } from "@/hooks/use-toast";

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

interface EnhancedProjectsTableProps {
  userRole?: AppRole | null;
  userId?: string;
}

const EnhancedProjectsTable: React.FC<EnhancedProjectsTableProps> = ({ userRole, userId }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [pipelineOpen, setPipelineOpen] = useState(false);
  const { toast } = useToast();

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

  // Export functionality
  const handleExportCSV = () => {
    const csvData = selectedIds.length > 0 
      ? projects.filter(p => selectedIds.includes(p.id))
      : filteredProjects;

    const headers = ["Title", "Status", "Type", "Budget Min", "Budget Max", "Currency", "Deadline", "Security Level", "Created At"];
    const csvContent = [
      headers.join(","),
      ...csvData.map(project => [
        `"${project.title}"`,
        project.status,
        project.project_type || "studio",
        project.budget_min || "",
        project.budget_max || "",
        project.currency || "V3C",
        project.deadline || "",
        project.security_level || "Standard",
        new Date(project.created_at).toLocaleDateString()
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `projects-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: `Exported ${csvData.length} projects to CSV`,
    });
  };

  const clearAllFilters = () => {
    handleFiltersChange({
      statusFilter: ["all"],
      typeFilter: "all",
      searchQuery: "",
      deadlineRange: { from: null, to: null },
    });
  };

  const hasActiveFilters = !statusFilter.includes("all") || typeFilter !== "all" || searchQuery || deadlineRange.from || deadlineRange.to;

  // Create dynamic status color mapping
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
      {/* Filters Section */}
      <ProjectsTableFiltersContainer
        statusOptions={statusOptions}
        typeOptions={typeOptions}
        onChange={handleFiltersChange}
      />

      {/* Action Bar */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="text-sm text-gray-400">
          Showing {filteredProjects.length} of {projects.length} projects
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <Download className="h-4 w-4 mr-2" />
            Export {selectedIds.length > 0 ? `(${selectedIds.length})` : ""}
          </Button>

          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={clearAllFilters}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Filters
            </Button>
          )}
        </div>
      </div>

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

export default EnhancedProjectsTable;
