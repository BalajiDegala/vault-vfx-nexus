
import { AdvancedFilters, Project } from "@/types/advancedFilters";

export const applyProjectFilters = (projects: Project[], filters: AdvancedFilters): Project[] => {
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
};

export const countActiveFilters = (filters: AdvancedFilters): number => {
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
};
