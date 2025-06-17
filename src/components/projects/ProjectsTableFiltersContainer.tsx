
import { useState } from "react";
import { Search, Filter, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface ProjectsTableFiltersContainerProps {
  statusOptions: { value: string; label: string }[];
  typeOptions: { value: string; label: string }[];
  onChange: (filters: {
    statusFilter: string[];
    typeFilter: string;
    searchQuery: string;
    deadlineRange: { from: string | null; to: string | null };
  }) => void;
}

const ProjectsTableFiltersContainer = ({
  statusOptions,
  typeOptions,
  onChange,
}: ProjectsTableFiltersContainerProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>(["all"]);
  const [typeFilter, setTypeFilter] = useState("all");
  const [deadlineRange, setDeadlineRange] = useState<{ from: string | null; to: string | null }>({ from: null, to: null });

  const handleFiltersUpdate = (updates: Partial<{
    statusFilter: string[];
    typeFilter: string;
    searchQuery: string;
    deadlineRange: { from: string | null; to: string | null };
  }>) => {
    const newFilters = {
      statusFilter: updates.statusFilter ?? statusFilter,
      typeFilter: updates.typeFilter ?? typeFilter,
      searchQuery: updates.searchQuery ?? searchQuery,
      deadlineRange: updates.deadlineRange ?? deadlineRange,
    };
    
    if (updates.statusFilter) setStatusFilter(updates.statusFilter);
    if (updates.typeFilter) setTypeFilter(updates.typeFilter);
    if (updates.searchQuery !== undefined) setSearchQuery(updates.searchQuery);
    if (updates.deadlineRange) setDeadlineRange(updates.deadlineRange);
    
    onChange(newFilters);
  };

  const handleStatusChange = (status: string, checked: boolean) => {
    let newStatusFilter: string[];
    
    if (status === "all") {
      newStatusFilter = checked ? ["all"] : [];
    } else {
      if (checked) {
        newStatusFilter = statusFilter.includes("all") 
          ? [status] 
          : [...statusFilter.filter(s => s !== "all"), status];
      } else {
        newStatusFilter = statusFilter.filter(s => s !== status);
        if (newStatusFilter.length === 0) {
          newStatusFilter = ["all"];
        }
      }
    }
    
    handleFiltersUpdate({ statusFilter: newStatusFilter });
  };

  const clearAllFilters = () => {
    handleFiltersUpdate({
      statusFilter: ["all"],
      typeFilter: "all",
      searchQuery: "",
      deadlineRange: { from: null, to: null },
    });
  };

  const hasActiveFilters = !statusFilter.includes("all") || typeFilter !== "all" || searchQuery || deadlineRange.from || deadlineRange.to;
  const activeFilterCount = (statusFilter.includes("all") ? 0 : statusFilter.length) + 
                           (typeFilter === "all" ? 0 : 1) + 
                           (searchQuery ? 1 : 0) + 
                           (deadlineRange.from || deadlineRange.to ? 1 : 0);

  return (
    <div className="space-y-4 mb-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => handleFiltersUpdate({ searchQuery: e.target.value })}
          className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      {/* Filter Dropdowns */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Status Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="border-gray-600 bg-gray-800 text-gray-200 hover:bg-gray-700 hover:text-white">
              <Filter className="h-4 w-4 mr-2" />
              Status
              {!statusFilter.includes("all") && (
                <Badge variant="secondary" className="ml-2 bg-blue-600 text-white">
                  {statusFilter.length}
                </Badge>
              )}
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-gray-800 border-gray-600 text-gray-200">
            <DropdownMenuLabel className="text-gray-300">Project Status</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-600" />
            {statusOptions.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={statusFilter.includes(option.value)}
                onCheckedChange={(checked) => handleStatusChange(option.value, checked)}
                className="text-gray-200 focus:bg-gray-700 focus:text-white"
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Type Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="border-gray-600 bg-gray-800 text-gray-200 hover:bg-gray-700 hover:text-white">
              <Filter className="h-4 w-4 mr-2" />
              Type
              {typeFilter !== "all" && (
                <Badge variant="secondary" className="ml-2 bg-blue-600 text-white">
                  1
                </Badge>
              )}
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-gray-800 border-gray-600 text-gray-200">
            <DropdownMenuLabel className="text-gray-300">Project Type</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-600" />
            {typeOptions.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={typeFilter === option.value}
                onCheckedChange={(checked) => {
                  if (checked) handleFiltersUpdate({ typeFilter: option.value });
                }}
                className="text-gray-200 focus:bg-gray-700 focus:text-white"
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">
              {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-gray-400 hover:text-white hover:bg-gray-700"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
        )}
      </div>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {!statusFilter.includes("all") && statusFilter.map((status) => (
            <Badge
              key={status}
              variant="secondary"
              className="bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
              onClick={() => handleStatusChange(status, false)}
            >
              Status: {statusOptions.find(opt => opt.value === status)?.label}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
          {typeFilter !== "all" && (
            <Badge
              variant="secondary"
              className="bg-purple-600 text-white hover:bg-purple-700 cursor-pointer"
              onClick={() => handleFiltersUpdate({ typeFilter: "all" })}
            >
              Type: {typeOptions.find(opt => opt.value === typeFilter)?.label}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          )}
          {searchQuery && (
            <Badge
              variant="secondary"
              className="bg-green-600 text-white hover:bg-green-700 cursor-pointer"
              onClick={() => handleFiltersUpdate({ searchQuery: "" })}
            >
              Search: "{searchQuery}"
              <X className="h-3 w-3 ml-1" />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectsTableFiltersContainer;
