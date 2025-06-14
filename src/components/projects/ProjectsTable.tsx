
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import ProjectsTableFilters from "./ProjectsTableFilters";
import ProjectsDataTable from "./ProjectsDataTable";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis
} from "@/components/ui/pagination";

// Utility constants/types (kept the same)
type Project = Database["public"]["Tables"]["projects"]["Row"];
const statusColor: Record<string, string> = {
  completed: "bg-blue-500/20 text-blue-400",
  open: "bg-green-500/20 text-green-400",
  draft: "bg-yellow-500/20 text-yellow-400",
  cancelled: "bg-red-500/20 text-red-400",
  review: "bg-cyan-500/20 text-cyan-400",
};
const statusOptions = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "completed", label: "Completed" },
  { value: "draft", label: "Draft" },
  { value: "cancelled", label: "Cancelled" },
  { value: "review", label: "Review" },
];
const typeOptions = [
  { value: "all", label: "All" },
  { value: "studio", label: "Studio" },
  { value: "personal", label: "Personal" },
  { value: "freelance", label: "Freelance" },
  { value: "test", label: "Test" },
];
type SortColumn = "title" | "status" | "budget" | "deadline" | "assigned_to" | "security_level" | "project_type";

// Main component (now much cleaner)
const ProjectsTable = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // filter and sort state
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortColumn, setSortColumn] = useState<SortColumn>("deadline");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
    if (statusFilter && statusFilter !== "all") {
      result = result.filter((p) => p.status === statusFilter);
    }
    if (typeFilter && typeFilter !== "all") {
      result = result.filter((p) => (p.project_type ?? "studio") === typeFilter);
    }
    // Reset to page 1 if filters change
    setCurrentPage(1);
    return result;
  // eslint-disable-next-line
  }, [projects, statusFilter, typeFilter]);

  const sortedProjects = useMemo(() => {
    let proj = [...filteredProjects];
    proj.sort((a, b) => {
      let aVal: any = a[sortColumn];
      let bVal: any = b[sortColumn];

      // Special sorting logic
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

  // Generate page numbers (simple: 1 ... N)
  const pageNumbers = () => {
    // Show max of 5 page buttons
    const arr = [];
    for (let i = Math.max(1, currentPage - 2); i <= Math.min(pageCount, currentPage + 2); i++) {
      arr.push(i);
    }
    return arr;
  };

  return (
    <div className="bg-gray-900/50 border border-gray-700 rounded-xl overflow-x-auto mb-8 p-4">
      <ProjectsTableFilters
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        statusOptions={statusOptions}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        typeOptions={typeOptions}
      />
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
      />

      {/* Pagination Controls */}
      {pageCount > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => goToPage(currentPage - 1)}
                tabIndex={0}
                style={{ cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
                aria-disabled={currentPage === 1}
              />
            </PaginationItem>
            {pageNumbers()[0] > 1 && (
              <PaginationItem>
                <PaginationLink onClick={() => goToPage(1)}>{1}</PaginationLink>
                {pageNumbers()[0] > 2 && <PaginationEllipsis />}
              </PaginationItem>
            )}
            {pageNumbers().map((num) => (
              <PaginationItem key={num}>
                <PaginationLink
                  isActive={num === currentPage}
                  onClick={() => goToPage(num)}
                >
                  {num}
                </PaginationLink>
              </PaginationItem>
            ))}
            {pageNumbers()[pageNumbers().length - 1] < pageCount && (
              <PaginationItem>
                {pageNumbers()[pageNumbers().length - 1] < pageCount - 1 && <PaginationEllipsis />}
                <PaginationLink onClick={() => goToPage(pageCount)}>{pageCount}</PaginationLink>
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationNext
                onClick={() => goToPage(currentPage + 1)}
                tabIndex={0}
                style={{ cursor: currentPage === pageCount ? "not-allowed" : "pointer" }}
                aria-disabled={currentPage === pageCount}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default ProjectsTable;
