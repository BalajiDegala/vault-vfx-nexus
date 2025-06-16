
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, X } from "lucide-react";

interface TaskFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  priorityFilter: string;
  onPriorityChange: (priority: string) => void;
  typeFilter: string;
  onTypeChange: (type: string) => void;
  assigneeFilter: string;
  onAssigneeChange: (assignee: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const TaskFilters = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  typeFilter,
  onTypeChange,
  assigneeFilter,
  onAssigneeChange,
  onClearFilters,
  hasActiveFilters
}: TaskFiltersProps) => {
  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-gray-900/50 border-gray-700 text-white placeholder-gray-400"
        />
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-1">
          <Filter className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-400">Filters:</span>
        </div>

        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[140px] bg-gray-900/50 border-gray-700">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={onPriorityChange}>
          <SelectTrigger className="w-[130px] bg-gray-900/50 border-gray-700">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={onTypeChange}>
          <SelectTrigger className="w-[140px] bg-gray-900/50 border-gray-700">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="modeling">Modeling</SelectItem>
            <SelectItem value="animation">Animation</SelectItem>
            <SelectItem value="lighting">Lighting</SelectItem>
            <SelectItem value="compositing">Compositing</SelectItem>
            <SelectItem value="rendering">Rendering</SelectItem>
          </SelectContent>
        </Select>

        <Select value={assigneeFilter} onValueChange={onAssigneeChange}>
          <SelectTrigger className="w-[140px] bg-gray-900/50 border-gray-700">
            <SelectValue placeholder="Assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assignees</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="unassigned">Unassigned</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Active Filter Badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {statusFilter !== 'all' && (
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
              Status: {statusFilter.replace('_', ' ')}
            </Badge>
          )}
          {priorityFilter !== 'all' && (
            <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400">
              Priority: {priorityFilter}
            </Badge>
          )}
          {typeFilter !== 'all' && (
            <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">
              Type: {typeFilter}
            </Badge>
          )}
          {assigneeFilter !== 'all' && (
            <Badge variant="secondary" className="bg-green-500/20 text-green-400">
              Assignee: {assigneeFilter}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskFilters;
