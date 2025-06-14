
import React, { useState } from "react";
import ProjectsTableFilters from "./ProjectsTableFilters";

type StatusOption = { value: string; label: string };
type TypeOption = { value: string; label: string };

interface ProjectsTableFiltersContainerProps {
  statusOptions: StatusOption[];
  typeOptions: TypeOption[];
  onChange: (filters: {
    statusFilter: string[];
    typeFilter: string;
    searchQuery: string;
    deadlineRange: { from: string | null; to: string | null };
  }) => void;
}

const ProjectsTableFiltersContainer: React.FC<ProjectsTableFiltersContainerProps> = ({
  statusOptions,
  typeOptions,
  onChange,
}) => {
  // Allow multi-select: The default is ["all"], which means "all statuses"
  const [statusFilter, setStatusFilter] = useState<string[]>(["all"]);
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [deadlineRange, setDeadlineRange] = useState<{ from: string | null; to: string | null }>({ from: null, to: null });

  React.useEffect(() => {
    onChange({
      statusFilter,
      typeFilter,
      searchQuery,
      deadlineRange,
    });
    // eslint-disable-next-line
  }, [statusFilter, typeFilter, searchQuery, deadlineRange]);

  return (
    <ProjectsTableFilters
      statusFilter={statusFilter}
      setStatusFilter={setStatusFilter}
      statusOptions={statusOptions}
      typeFilter={typeFilter}
      setTypeFilter={setTypeFilter}
      typeOptions={typeOptions}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      deadlineRange={deadlineRange}
      setDeadlineRange={setDeadlineRange}
    />
  );
};

export default ProjectsTableFiltersContainer;
