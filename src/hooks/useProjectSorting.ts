
import { useState, useMemo } from "react";
import { Database } from "@/integrations/supabase/types";

type Project = Database["public"]["Tables"]["projects"]["Row"];
type SortColumn = "title" | "status" | "budget" | "deadline" | "assigned_to" | "security_level" | "project_type";

export const useProjectSorting = (filteredProjects: Project[], itemsPerPage: number = 10) => {
  const [sortColumn, setSortColumn] = useState<SortColumn>("deadline");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedProjects = useMemo(() => {
    const proj = [...filteredProjects];
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

  const pageCount = Math.ceil(sortedProjects.length / itemsPerPage);
  const pagedProjects = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedProjects.slice(start, start + itemsPerPage);
  }, [sortedProjects, currentPage, itemsPerPage]);

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

  const resetPage = () => setCurrentPage(1);

  return {
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
  };
};
