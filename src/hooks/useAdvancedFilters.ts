import { useState, useMemo, useEffect } from "react";
import { Database } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Project = Database["public"]["Tables"]["projects"]["Row"];

export interface AdvancedFilters {
  statusFilter: string[];
  typeFilter: string;
  searchQuery: string;
  deadlineRange: { from: string | null; to: string | null };
  createdDateRange: { from: string | null; to: string | null };
  budgetRange: { min: number | null; max: number | null };
  skillsFilter: string[];
  assignedFilter: string;
  securityLevelFilter: string;
}

export interface SavedFilterPreset {
  id: string;
  name: string;
  filters: AdvancedFilters;
  user_id: string;
  created_at: string;
}

const defaultFilters: AdvancedFilters = {
  statusFilter: ["all"],
  typeFilter: "all",
  searchQuery: "",
  deadlineRange: { from: null, to: null },
  createdDateRange: { from: null, to: null },
  budgetRange: { min: null, max: null },
  skillsFilter: [],
  assignedFilter: "all",
  securityLevelFilter: "all",
};

export const useAdvancedFilters = (projects: Project[]) => {
  const [filters, setFilters] = useState<AdvancedFilters>(defaultFilters);
  const [savedPresets, setSavedPresets] = useState<SavedFilterPreset[]>([]);
  const { toast } = useToast();

  // Load saved presets
  useEffect(() => {
    loadSavedPresets();
  }, []);

  const loadSavedPresets = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("filter_presets" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSavedPresets((data as unknown as SavedFilterPreset[]) || []);
    } catch (error) {
      console.error("Error loading filter presets:", error);
    }
  };

  const saveFilterPreset = async (name: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("filter_presets" as any)
        .insert({
          name,
          filters,
          user_id: user.id,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Filter preset saved successfully",
      });

      loadSavedPresets();
    } catch (error) {
      console.error("Error saving filter preset:", error);
      toast({
        title: "Error",
        description: "Failed to save filter preset",
        variant: "destructive",
      });
    }
  };

  const loadFilterPreset = (preset: SavedFilterPreset) => {
    setFilters(preset.filters);
    toast({
      title: "Preset Loaded",
      description: `Applied filter preset: ${preset.name}`,
    });
  };

  const deleteFilterPreset = async (presetId: string) => {
    try {
      const { error } = await supabase
        .from("filter_presets" as any)
        .delete()
        .eq("id", presetId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Filter preset deleted successfully",
      });

      loadSavedPresets();
    } catch (error) {
      console.error("Error deleting filter preset:", error);
      toast({
        title: "Error",
        description: "Failed to delete filter preset",
        variant: "destructive",
      });
    }
  };

  const clearAllFilters = () => {
    setFilters(defaultFilters);
  };

  const filteredProjects = useMemo(() => {
    let result = [...projects];
    
    // Status filter
    if (filters.statusFilter.length > 0 && !filters.statusFilter.includes("all")) {
      result = result.filter((p) => filters.statusFilter.includes(p.status));
    }
    
    // Type filter
    if (filters.typeFilter && filters.typeFilter !== "all") {
      result = result.filter((p) => (p.project_type ?? "studio") === filters.typeFilter);
    }
    
    // Search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(p =>
        (p.title && p.title.toLowerCase().includes(query)) ||
        (p.description && p.description.toLowerCase().includes(query)) ||
        (p.project_code && p.project_code.toLowerCase().includes(query))
      );
    }
    
    // Deadline range
    if (filters.deadlineRange.from) {
      result = result.filter(p => p.deadline && new Date(p.deadline) >= new Date(filters.deadlineRange.from as string));
    }
    
    if (filters.deadlineRange.to) {
      result = result.filter(p => p.deadline && new Date(p.deadline) <= new Date(filters.deadlineRange.to as string));
    }

    // Created date range
    if (filters.createdDateRange.from) {
      result = result.filter(p => new Date(p.created_at) >= new Date(filters.createdDateRange.from as string));
    }
    
    if (filters.createdDateRange.to) {
      result = result.filter(p => new Date(p.created_at) <= new Date(filters.createdDateRange.to as string));
    }

    // Budget range
    if (filters.budgetRange.min !== null) {
      result = result.filter(p => p.budget_min && p.budget_min >= (filters.budgetRange.min as number));
    }
    
    if (filters.budgetRange.max !== null) {
      result = result.filter(p => p.budget_max && p.budget_max <= (filters.budgetRange.max as number));
    }

    // Skills filter
    if (filters.skillsFilter.length > 0) {
      result = result.filter(p => 
        p.skills_required && 
        filters.skillsFilter.some(skill => 
          p.skills_required!.some(projectSkill => 
            projectSkill.toLowerCase().includes(skill.toLowerCase())
          )
        )
      );
    }

    // Assigned filter
    if (filters.assignedFilter === "assigned") {
      result = result.filter(p => p.assigned_to !== null);
    } else if (filters.assignedFilter === "unassigned") {
      result = result.filter(p => p.assigned_to === null);
    }

    // Security level filter
    if (filters.securityLevelFilter && filters.securityLevelFilter !== "all") {
      result = result.filter(p => (p.security_level ?? "Standard") === filters.securityLevelFilter);
    }
    
    return result;
  }, [projects, filters]);

  const updateFilters = (newFilters: Partial<AdvancedFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.statusFilter.length > 0 && !filters.statusFilter.includes("all")) count++;
    if (filters.typeFilter !== "all") count++;
    if (filters.searchQuery) count++;
    if (filters.deadlineRange.from || filters.deadlineRange.to) count++;
    if (filters.createdDateRange.from || filters.createdDateRange.to) count++;
    if (filters.budgetRange.min !== null || filters.budgetRange.max !== null) count++;
    if (filters.skillsFilter.length > 0) count++;
    if (filters.assignedFilter !== "all") count++;
    if (filters.securityLevelFilter !== "all") count++;
    return count;
  }, [filters]);

  return {
    filters,
    filteredProjects,
    updateFilters,
    clearAllFilters,
    activeFiltersCount,
    savedPresets,
    saveFilterPreset,
    loadFilterPreset,
    deleteFilterPreset,
  };
};
