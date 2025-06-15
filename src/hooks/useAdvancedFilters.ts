
import { useState, useMemo } from "react";
import { Project, AdvancedFilters, defaultFilters } from "@/types/advancedFilters";
import { useFilterPresets } from "@/hooks/useFilterPresets";
import { applyProjectFilters, countActiveFilters } from "@/utils/projectFiltering";

export const useAdvancedFilters = (projects: Project[]) => {
  const [filters, setFilters] = useState<AdvancedFilters>(defaultFilters);

  const {
    savedPresets,
    saveFilterPreset: savePreset,
    loadFilterPreset,
    deleteFilterPreset,
  } = useFilterPresets();

  const saveFilterPreset = (name: string) => {
    savePreset(name, filters);
  };

  const loadPreset = (preset: any) => {
    const loadedFilters = loadFilterPreset(preset);
    setFilters(loadedFilters);
  };

  const clearAllFilters = () => {
    setFilters(defaultFilters);
  };

  const filteredProjects = useMemo(() => {
    return applyProjectFilters(projects, filters);
  }, [projects, filters]);

  const updateFilters = (newFilters: Partial<AdvancedFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const activeFiltersCount = useMemo(() => {
    return countActiveFilters(filters);
  }, [filters]);

  return {
    filters,
    filteredProjects,
    updateFilters,
    clearAllFilters,
    activeFiltersCount,
    savedPresets,
    saveFilterPreset,
    loadFilterPreset: loadPreset,
    deleteFilterPreset,
  };
};
