
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import ProjectsDataTable from "./ProjectsDataTable";
import ProjectsPagination from "./ProjectsPagination";
import ProjectsTableFiltersContainer from "./ProjectsTableFiltersContainer";
import ProjectsBulkActionsBar from "./ProjectsBulkActionsBar";
import { useToast } from "@/hooks/use-toast";

// Utility constants/types
type Project = Database["public"]["Tables"]["projects"]["Row"];
type ProjectStatus = Database["public"]["Enums"]["project_status"];

const statusColor: Record<string, string> = {
  completed: "bg-blue-500/20 text-blue-400",
  open: "bg-green-500/20 text-green-400",
  draft: "bg-yellow-500/20 text-yellow-400",
  cancelled: "bg-red-500/20 text-red-400",
  review: "bg-cyan-500/20 text-cyan-400",
  in_progress: "bg-purple-500/20 text-purple-400",
};

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

type SortColumn = "title" | "status" | "budget" | "deadline" | "assigned_to" | "security_level" | "project_type";

// Main component
const ProjectsTable = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const { toast } = useToast();

  // Change: multi-select filter
  const [statusFilter, setStatusFilter] = useState<string[]>(["all"]);

  // Filter logic state (moved to parent for control)
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [deadlineRange, setDeadlineRange] = useState<{ from: string | null; to: string | null }>({ from: null, to: null });

  // Sorting state
  const [sortColumn, setSortColumn] = useState<SortColumn>("deadline");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // New: Track selected project IDs
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectAllActive, setSelectAllActive] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("projects")
        .select("*");
      if (!error && data) setProjects(data);
      setLoading(false);
    };

    fetchProjects();
  }, []);

  // Handler: Receive filter updates from container
  const handleFiltersChange = (filters: {
    statusFilter: string[];
    typeFilter: string;
    searchQuery: string;
    deadlineRange: { from: string | null; to: string | null };
  }) => {
    setStatusFilter(filters.statusFilter);
    setTypeFilter(filters.typeFilter);
    setSearchQuery(filters.searchQuery);
    setDeadlineRange(filters.deadlineRange);
    setCurrentPage(1); // Reset page on filter
  };

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const filteredProjects = useMemo(() => {
    let result = [...projects];
    // Change: allow multiple statuses. If "all" in array, don't filter.
    if (
      statusFilter.length > 0 &&
      !statusFilter.includes("all")
    ) {
      result = result.filter((p) =>
        statusFilter.includes(p.status)
      );
    }
    if (typeFilter && typeFilter !== "all") {
      result = result.filter((p) => (p.project_type ?? "studio") === typeFilter);
    }
    if (searchQuery) {
      result = result.filter(p =>
        (p.title && p.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    if (deadlineRange.from) {
      result = result.filter(p => p.deadline && new Date(p.deadline) >= new Date(deadlineRange.from as string));
    }
    if (deadlineRange.to) {
      result = result.filter(p => p.deadline && new Date(p.deadline) <= new Date(deadlineRange.to as string));
    }
    return result;
  }, [projects, statusFilter, typeFilter, searchQuery, deadlineRange]);

  const sortedProjects = useMemo(() => {
    let proj = [...filteredProjects];
    proj.sort((a, b) => {
      let aVal: any = a[sortColumn];
      let bVal: any = b[sortColumn];

      if (sortColumn === "budget") {
        aVal = ((a.budget_min ?? 0) + (a.budget_max ?? 0)) / 2;
        bVal = ((b.budget_min ?? 0) + (b.budget_max ?? 0)) / 2;
      }
      if (sortColumn === "assigned_to") {
        aVal = !!a.assigned_to;
        bVal = !!b.assigned_to;
      }
      if (sortColumn === "deadline") {
        aVal = a.deadline ? new Date(a.deadline).getTime() : Number.MAX_SAFE_INTEGER;
        bVal = b.deadline ? new Date(b.deadline).getTime() : Number.MAX_SAFE_INTEGER;
      }

      if (aVal === undefined || aVal === null) aVal = "";
      if (bVal === undefined || bVal === null) bVal = "";

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return proj;
  }, [filteredProjects, sortColumn, sortDirection]);

  // Pagination
  const pageCount = Math.ceil(sortedProjects.length / itemsPerPage);
  const pagedProjects = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedProjects.slice(start, start + itemsPerPage);
  }, [sortedProjects, currentPage, itemsPerPage]);

  // Modal state
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [pipelineOpen, setPipelineOpen] = useState(false);

  // Page change handler
  const goToPage = (p: number) => {
    if (p < 1 || p > pageCount) return;
    setCurrentPage(p);
  };

  const pageNumbersArray = () => {
    const arr = [];
    for (let i = Math.max(1, currentPage - 2); i <= Math.min(pageCount, currentPage + 2); i++) {
      arr.push(i);
    }
    return arr;
  };
  
  // Bulk status update
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
        setSelectedIds([]);
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

  // Select all across all filtered projects
  const handleSelectAllFiltered = () => {
    if (selectAllActive) {
      setSelectedIds([]);
      setSelectAllActive(false);
    } else {
      const ids = filteredProjects.map((p) => p.id);
      setSelectedIds(ids);
      setSelectAllActive(true);
    }
  };

  // Update selectAllActive when selectedIds/filteredProjects change
  useEffect(() => {
    setSelectAllActive(
      filteredProjects.length > 0 &&
      selectedIds.length === filteredProjects.length
    );
  }, [selectedIds, filteredProjects]);

  // Deselect on new filter, page, or project list
  useEffect(() => {
    setSelectedIds([]);
    setSelectAllActive(false);
  }, [projects, currentPage, statusFilter, typeFilter, searchQuery, deadlineRange]);

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    
    setBulkActionLoading(true);
    try {
      const { error } = await supabase.from("projects").delete().in("id", selectedIds);
      if (!error) {
        setProjects((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
        setSelectedIds([]);
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

  // Select logic helpers
  const isAllOnPageSelected = pagedProjects.length > 0 && pagedProjects.every(p => selectedIds.includes(p.id));
  const isIndeterminate = selectedIds.length > 0 && !isAllOnPageSelected;

  // For actions that should be disabled if nothing selected
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
          onDeselectAll={() => {
            setSelectedIds([]);
            setSelectAllActive(false);
          }}
          onBulkStatusChange={handleBulkStatusChange}
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
        // Bulk selection props
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        isAllOnPageSelected={
          pagedProjects.length > 0 && pagedProjects.every((p) => selectedIds.includes(p.id))
        }
        isIndeterminate={
          selectedIds.length > 0 &&
          !pagedProjects.every((p) => selectedIds.includes(p.id))
        }
        pagedProjects={pagedProjects}
        // NEW: pass selectAllFiltered logic
        onSelectAllFiltered={handleSelectAllFiltered}
        selectAllActive={selectAllActive}
        totalFilteredCount={filteredProjects.length}
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
