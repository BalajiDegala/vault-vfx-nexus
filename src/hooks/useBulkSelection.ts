
import { useState, useEffect } from "react";
import { Database } from "@/integrations/supabase/types";

type Project = Database["public"]["Tables"]["projects"]["Row"];

export const useBulkSelection = (filteredProjects: Project[], currentPage: number) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectAllActive, setSelectAllActive] = useState(false);

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

  const handleDeselectAll = () => {
    setSelectedIds([]);
    setSelectAllActive(false);
  };

  // Update selectAllActive when selectedIds/filteredProjects change
  useEffect(() => {
    setSelectAllActive(
      filteredProjects.length > 0 &&
      selectedIds.length === filteredProjects.length
    );
  }, [selectedIds, filteredProjects]);

  // Deselect on new filter or page change
  useEffect(() => {
    setSelectedIds([]);
    setSelectAllActive(false);
  }, [currentPage]);

  return {
    selectedIds,
    setSelectedIds,
    selectAllActive,
    handleSelectAllFiltered,
    handleDeselectAll
  };
};
