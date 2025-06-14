
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Loader2 } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type Project = Database["public"]["Tables"]["projects"]["Row"];

interface ProjectRowProps {
  project: Project;
  statusColor: Record<string, string>;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  // Bulk selection
  isSelected?: boolean;
  onSelectChange?: (checked: boolean) => void;
}

const ProjectRow: React.FC<ProjectRowProps> = ({
  project,
  statusColor,
  onEdit,
  onDelete,
  isSelected = false,
  onSelectChange,
}) => (
  <tr
    className="hover:bg-gray-800/50 transition-colors cursor-pointer"
    onClick={() => {
      if ((window as any)._actionClick) {
        (window as any)._actionClick = false;
        return;
      }
      // handled outside for opening pipeline
    }}
    data-project-id={project.id}
  >
    {/* Bulk checkbox */}
    <td className="w-8 text-center p-0">
      {typeof onSelectChange === "function" ? (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={e => onSelectChange(e.target.checked)}
          onClick={e => e.stopPropagation()}
          aria-label={`Select row for ${project.title}`}
          className="accent-blue-500"
        />
      ) : null}
    </td>
    <td className="font-medium text-white">{project.title}</td>
    <td>
      <Badge className={statusColor[project.status ?? "draft"] ?? "bg-gray-500/20 text-gray-400"}>
        {project.status}
      </Badge>
    </td>
    <td>
      {project.budget_min && project.budget_max
        ? `${project.budget_min}–${project.budget_max} ${project.currency ?? "V3C"}`
        : "—"}
    </td>
    <td>
      {project.deadline ? new Date(project.deadline).toLocaleDateString() : "—"}
    </td>
    <td>
      {project.assigned_to
        ? <span className="text-blue-300">Assigned</span>
        : <span className="text-gray-400">Unassigned</span>}
    </td>
    <td>{project.security_level ?? "Standard"}</td>
    <td className="capitalize">{project.project_type ?? "studio"}</td>
    <td>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Edit ${project.title}`}
          onClick={e => {
            e.stopPropagation();
            (window as any)._actionClick = true;
            onEdit(project);
          }}
        >
          <Edit className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Delete ${project.title}`}
          onClick={e => {
            e.stopPropagation();
            (window as any)._actionClick = true;
            onDelete(project);
          }}
        >
          <Trash2 className="w-4 h-4 text-red-400" />
        </Button>
      </div>
    </td>
  </tr>
);

export default ProjectRow;
