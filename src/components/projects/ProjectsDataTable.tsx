
import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, ArrowUp, ArrowDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Database } from "@/integrations/supabase/types";
import ProjectPipelineViewer from "./ProjectPipelineViewer";

type Project = Database["public"]["Tables"]["projects"]["Row"];
type SortColumn = "title" | "status" | "budget" | "deadline" | "assigned_to" | "security_level" | "project_type";

interface ProjectsDataTableProps {
  loading: boolean;
  sortedProjects: Project[];
  sortColumn: SortColumn;
  sortDirection: "asc" | "desc";
  handleSort: (col: SortColumn) => void;
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
  pipelineOpen: boolean;
  setPipelineOpen: (open: boolean) => void;
  statusColor: Record<string, string>;
}

const ProjectsDataTable: React.FC<ProjectsDataTableProps> = ({
  loading, sortedProjects, sortColumn, sortDirection, handleSort,
  selectedProject, setSelectedProject, pipelineOpen, setPipelineOpen,
  statusColor
}) => (
  <>
    <Table>
      <TableCaption className="text-left px-4 py-2">All Projects ({sortedProjects.length})</TableCaption>
      <TableHeader>
        <TableRow>
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
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center">
              <Loader2 className="inline-block animate-spin text-blue-400 mx-1" />
              Loading projects...
            </TableCell>
          </TableRow>
        ) : sortedProjects.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center text-gray-400">
              No projects found.
            </TableCell>
          </TableRow>
        ) : (
          sortedProjects.map((project) => (
            <TableRow
              key={project.id}
              className="hover:bg-gray-800/50 transition-colors cursor-pointer"
              onClick={() => {
                setSelectedProject(project);
                setPipelineOpen(true);
              }}
            >
              <TableCell className="font-medium text-white">{project.title}</TableCell>
              <TableCell>
                <Badge className={statusColor[project.status ?? "draft"] ?? "bg-gray-500/20 text-gray-400"}>
                  {project.status}
                </Badge>
              </TableCell>
              <TableCell>
                {project.budget_min && project.budget_max
                  ? `${project.budget_min}–${project.budget_max} ${project.currency ?? "V3C"}`
                  : "—"}
              </TableCell>
              <TableCell>
                {project.deadline ? new Date(project.deadline).toLocaleDateString() : "—"}
              </TableCell>
              <TableCell>
                {project.assigned_to
                  ? <span className="text-blue-300">Assigned</span>
                  : <span className="text-gray-400">Unassigned</span>}
              </TableCell>
              <TableCell>{project.security_level ?? "Standard"}</TableCell>
              <TableCell className="capitalize">{project.project_type ?? "studio"}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
    <ProjectPipelineViewer
      project={selectedProject}
      open={pipelineOpen}
      onOpenChange={setPipelineOpen}
    />
  </>
);

export default ProjectsDataTable;
