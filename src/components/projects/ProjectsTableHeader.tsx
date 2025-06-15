
import React from "react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type SortColumn = "title" | "status" | "budget" | "deadline" | "assigned_to" | "security_level" | "project_type";

interface ProjectsTableHeaderProps {
  sortColumn: SortColumn;
  sortDirection: "asc" | "desc";
  handleSort: (col: SortColumn) => void;
  selectAllActive: boolean;
  isIndeterminate: boolean;
  onSelectAllChange: () => void;
  totalFilteredCount?: number;
  isAllOnPageSelected: boolean;
}

const ProjectsTableHeader: React.FC<ProjectsTableHeaderProps> = ({
  sortColumn,
  sortDirection,
  handleSort,
  selectAllActive,
  isIndeterminate,
  onSelectAllChange,
  totalFilteredCount,
  isAllOnPageSelected,
}) => {
  return (
    <TableHeader>
      <TableRow>
        {/* Bulk selection checkbox header */}
        <TableHead className="w-8 text-center p-0">
          <input
            type="checkbox"
            aria-label="Select all"
            checked={selectAllActive}
            ref={input => {
              if (input) input.indeterminate = isIndeterminate;
            }}
            onChange={onSelectAllChange}
            className="accent-blue-500"
          />
          <span className="block text-[0.65rem] text-blue-300">
            {selectAllActive
              ? `All ${totalFilteredCount} selected`
              : isAllOnPageSelected
              ? "All page"
              : ""}
          </span>
        </TableHead>
        <TableHead className="cursor-pointer select-none" onClick={() => handleSort("title")}>
          Title
          {sortColumn === "title" && (sortDirection === "asc" ? <ArrowUp className="inline ml-1 w-4 h-4" /> : <ArrowDown className="inline ml-1 w-4 h-4" />)}
        </TableHead>
        <TableHead className="cursor-pointer select-none" onClick={() => handleSort("status")}>
          Status
          {sortColumn === "status" && (sortDirection === "asc" ? <ArrowUp className="inline ml-1 w-4 h-4" /> : <ArrowDown className="inline ml-1 w-4 h-4" />)}
        </TableHead>
        <TableHead className="cursor-pointer select-none" onClick={() => handleSort("budget")}>
          Budget
          {sortColumn === "budget" && (sortDirection === "asc" ? <ArrowUp className="inline ml-1 w-4 h-4" /> : <ArrowDown className="inline ml-1 w-4 h-4" />)}
        </TableHead>
        <TableHead className="cursor-pointer select-none" onClick={() => handleSort("deadline")}>
          Deadline
          {sortColumn === "deadline" && (sortDirection === "asc" ? <ArrowUp className="inline ml-1 w-4 h-4" /> : <ArrowDown className="inline ml-1 w-4 h-4" />)}
        </TableHead>
        <TableHead className="cursor-pointer select-none" onClick={() => handleSort("assigned_to")}>
          Assigned To
          {sortColumn === "assigned_to" && (sortDirection === "asc" ? <ArrowUp className="inline ml-1 w-4 h-4" /> : <ArrowDown className="inline ml-1 w-4 h-4" />)}
        </TableHead>
        <TableHead className="cursor-pointer select-none" onClick={() => handleSort("security_level")}>
          Security Level
          {sortColumn === "security_level" && (sortDirection === "asc" ? <ArrowUp className="inline ml-1 w-4 h-4" /> : <ArrowDown className="inline ml-1 w-4 h-4" />)}
        </TableHead>
        <TableHead className="cursor-pointer select-none" onClick={() => handleSort("project_type")}>
          Type
          {sortColumn === "project_type" && (sortDirection === "asc" ? <ArrowUp className="inline ml-1 w-4 h-4" /> : <ArrowDown className="inline ml-1 w-4 h-4" />)}
        </TableHead>
        <TableHead>
          Actions
        </TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default ProjectsTableHeader;
