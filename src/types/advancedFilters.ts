
import { Database } from "@/integrations/supabase/types";

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

export const defaultFilters: AdvancedFilters = {
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

export type { Project };
