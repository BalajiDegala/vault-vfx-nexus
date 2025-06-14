
import React from "react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";

type StatusOption = { value: string; label: string };
type TypeOption = { value: string; label: string };

interface ProjectsTableFiltersProps {
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  typeFilter: string;
  setTypeFilter: (v: string) => void;
  statusOptions: StatusOption[];
  typeOptions: TypeOption[];
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  deadlineRange: { from: string | null; to: string | null };
  setDeadlineRange: (r: { from: string | null; to: string | null }) => void;
}

const ProjectsTableFilters: React.FC<ProjectsTableFiltersProps> = ({
  statusFilter, setStatusFilter, statusOptions,
  typeFilter, setTypeFilter, typeOptions,
  searchQuery, setSearchQuery,
  deadlineRange, setDeadlineRange,
}) => (
  <div className="flex flex-col md:flex-row md:items-center gap-4 mb-3">
    <div className="flex items-center gap-2">
      <Filter className="h-4 w-4 mr-1 text-gray-400" />
      <span className="text-gray-300 font-semibold mr-2">Status</span>
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-32 h-8 bg-gray-800 border-gray-700 text-white">
          <SelectValue>{statusOptions.find(o => o.value === statusFilter)?.label}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map(option => (
            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
    <div className="flex items-center gap-2">
      <span className="text-gray-300 font-semibold mr-2">Type</span>
      <Select value={typeFilter} onValueChange={setTypeFilter}>
        <SelectTrigger className="w-32 h-8 bg-gray-800 border-gray-700 text-white">
          <SelectValue>{typeOptions.find(o => o.value === typeFilter)?.label}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {typeOptions.map(option => (
            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    {/* New: Keyword Search */}
    <div className="flex items-center gap-2 flex-grow">
      <input
        type="text"
        className="w-full h-8 bg-gray-800 border border-gray-700 rounded px-2 text-white placeholder-gray-400"
        placeholder="Search projects..."
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        aria-label="Search projects"
      />
    </div>
    {/* New: Deadline Date Range */}
    <div className="flex items-center gap-2">
      <label className="text-gray-300 font-semibold mr-2">Deadline</label>
      <input
        type="date"
        className="h-8 bg-gray-800 border border-gray-700 rounded px-2 text-white"
        value={deadlineRange.from || ""}
        onChange={e => setDeadlineRange({ ...deadlineRange, from: e.target.value || null })}
      />
      <span className="mx-1 text-gray-400">to</span>
      <input
        type="date"
        className="h-8 bg-gray-800 border border-gray-700 rounded px-2 text-white"
        value={deadlineRange.to || ""}
        onChange={e => setDeadlineRange({ ...deadlineRange, to: e.target.value || null })}
      />
    </div>
  </div>
);

export default ProjectsTableFilters;
