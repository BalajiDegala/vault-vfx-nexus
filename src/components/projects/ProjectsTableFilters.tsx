
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
}

const ProjectsTableFilters: React.FC<ProjectsTableFiltersProps> = ({
  statusFilter, setStatusFilter, statusOptions,
  typeFilter, setTypeFilter, typeOptions,
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
  </div>
);

export default ProjectsTableFilters;
