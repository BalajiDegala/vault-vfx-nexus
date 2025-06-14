
import React from "react";
import { Filter } from "lucide-react";

type StatusOption = { value: string; label: string };
type TypeOption = { value: string; label: string };

interface ProjectsTableFiltersProps {
  statusFilter: string[];
  setStatusFilter: (v: string[]) => void;
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
    {/* Multi-select Status Filter (checkbox list) */}
    <div className="flex items-center gap-2">
      <Filter className="h-4 w-4 mr-1 text-gray-400" />
      <span className="text-gray-300 font-semibold mr-2">Status</span>
      <div className="flex flex-wrap gap-1">
        {statusOptions.map(option => (
          <label
            key={option.value}
            className={`flex items-center gap-1 px-2 py-1 rounded cursor-pointer
              ${statusFilter.includes(option.value) ? "bg-blue-800/40 border-blue-600" : "bg-gray-800 border-gray-700"}
              border`}
          >
            <input
              type="checkbox"
              checked={statusFilter.includes(option.value)}
              onChange={e => {
                if (e.target.checked) {
                  setStatusFilter(
                    option.value === "all"
                      ? ["all"]
                      : statusFilter.filter(s => s !== "all").concat(option.value)
                  );
                } else {
                  const filtered = statusFilter.filter(s => s !== option.value);
                  setStatusFilter(
                    filtered.length === 0 ? ["all"] : filtered
                  );
                }
              }}
              className="accent-blue-500"
              aria-label={option.label}
            />
            <span className="text-white text-sm">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
    <div className="flex items-center gap-2">
      <span className="text-gray-300 font-semibold mr-2">Type</span>
      <select
        value={typeFilter}
        onChange={e => setTypeFilter(e.target.value)}
        className="w-32 h-8 bg-gray-800 border-gray-700 text-white rounded px-2"
      >
        {typeOptions.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
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
