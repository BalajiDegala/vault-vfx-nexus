
import { useState, useMemo, useEffect } from "react";
import { Database } from "@/integrations/supabase/types";

type Project = Database["public"]["Tables"]["projects"]["Row"];

export const useProjectFilters = (projects: Project[]) => {
  const [statusFilter, setStatusFilter] = useState<string[]>(["all"]);
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [deadlineRange, setDeadlineRange] = useState<{ from: string | null; to: string | null }>({ 
    from: null, 
    to: null 
  });

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
  };

  const filteredProjects = useMemo(() => {
    let result = [...projects];
    
    if (statusFilter.length > 0 && !statusFilter.includes("all")) {
      result = result.filter((p) => statusFilter.includes(p.status));
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

  return {
    statusFilter,
    typeFilter,
    searchQuery,
    deadlineRange,
    filteredProjects,
    handleFiltersChange
  };
};
