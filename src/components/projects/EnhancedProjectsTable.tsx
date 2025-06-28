import logger from "@/lib/logger";
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
    try {
      logger.log("🔍 Fetching projects for user:", userId, "role:", userRole);
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        logger.error("❌ Error fetching projects:", error);
        toast({
          title: "Error",
          description: "Failed to load projects. Please try again.",
          variant: "destructive"
        });
        setProjects([]);
      } else {
        logger.log("✅ Successfully fetched", data?.length || 0, "projects");
        setProjects(data || []);
      }
    } catch (error) {
      logger.error("💥 Unexpected error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading projects.",
        variant: "destructive"
      });
      setProjects([]);
    } finally {
      setLoading(false);
    }
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
    completed: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    open: "bg-green-500/20 text-green-300 border-green-500/30",
    draft: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    cancelled: "bg-red-500/20 text-red-300 border-red-500/30",
    review: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    in_progress: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  };

  const isAllOnPageSelected = pagedProjects.length > 0 && pagedProjects.every(p => selectedIds.includes(p.id));
  const isIndeterminate = selectedIds.length > 0 && !isAllOnPageSelected;
  const anySelected = selectedIds.length > 0;

  if (loading) {
    return (
      <div className="bg-gray-800 border border-gray-600 rounded-xl overflow-x-auto mb-8 p-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-300">Loading projects...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 border border-gray-600 rounded-xl overflow-x-auto mb-8 p-4 shadow-xl">
      {/* Filters Section */}
      <ProjectsTableFiltersContainer
        statusOptions={statusOptions}
        typeOptions={typeOptions}
        onChange={handleFiltersChange}
      />

      {/* Action Bar */}
      <div className="flex items-center justify-between gap-4 mb-4 p-4 bg-gray-700/30 rounded-lg border border-gray-600">
        <div className="text-sm text-gray-300 font-medium">
          Showing <span className="text-white">{filteredProjects.length}</span> of <span className="text-white">{projects.length}</span> projects
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="border-gray-500 bg-gray-700 text-gray-200 hover:bg-gray-600 hover:text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Export {selectedIds.length > 0 ? `(${selectedIds.length})` : ""}
          </Button>

          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={clearAllFilters}
              className="border-gray-500 bg-gray-700 text-gray-200 hover:bg-gray-600 hover:text-white"
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
