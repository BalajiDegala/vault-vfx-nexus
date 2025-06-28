
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import ProjectStatusChanger from "./ProjectStatusChanger";
import ProjectStatusHistory from "./ProjectStatusHistory";
import { useNavigate } from "react-router-dom";

type Project = Database["public"]["Tables"]["projects"]["Row"];
type AppRole = Database["public"]["Enums"]["app_role"];

interface ProjectRowProps {
  project: Project;
  statusColor: Record<string, string>;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onProjectUpdate?: () => void;
  userRole?: AppRole | null;
  userId?: string;
  // Bulk selection
  isSelected?: boolean;
  onSelectChange?: (checked: boolean) => void;
}

const ProjectRow: React.FC<ProjectRowProps> = ({
  project,
  statusColor,
  onEdit,
  onDelete,
  onProjectUpdate,
  userRole,
  userId,
  isSelected = false,
  onSelectChange,
}) => {
  const navigate = useNavigate();

  const handleProjectNameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/projects/${project.id}`);
  };

  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/projects/${project.id}`);
  };

  return (
    <tr
      className="hover:bg-gray-800/50 transition-colors"
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
      <td className="font-medium text-white">
        <button
          onClick={handleProjectNameClick}
          className="text-left hover:text-blue-400 transition-colors underline-offset-2 hover:underline text-white"
        >
          {project.title}
        </button>
      </td>
      <td>
        <div className="flex items-center gap-2">
          {userRole && userId ? (
            <ProjectStatusChanger
              project={project}
              userRole={userRole}
              userId={userId}
              onStatusChanged={() => onProjectUpdate?.()}
            />
          ) : (
            <Badge className={statusColor[project.status ?? "draft"] ?? "bg-gray-500/20 text-gray-400"}>
              {project.status}
            </Badge>
          )}
          <ProjectStatusHistory projectId={project.id} />
        </div>
      </td>
      <td className="text-gray-300">
        {project.budget_min && project.budget_max
          ? `${project.budget_min}–${project.budget_max} ${project.currency ?? "V3C"}`
          : "—"}
      </td>
      <td className="text-gray-300">
        {project.deadline ? new Date(project.deadline).toLocaleDateString() : "—"}
      </td>
      <td>
        {project.assigned_to
          ? <span className="text-blue-300">Assigned</span>
          : <span className="text-gray-400">Unassigned</span>}
      </td>
      <td className="text-gray-300">{project.security_level ?? "Standard"}</td>
      <td className="capitalize text-gray-300">{project.project_type ?? "studio"}</td>
      <td>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label={`View ${project.title}`}
            onClick={handleViewClick}
            className="text-gray-400 hover:text-white"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Edit ${project.title}`}
            onClick={e => {
              e.stopPropagation();
              onEdit(project);
            }}
            className="text-gray-400 hover:text-white"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Delete ${project.title}`}
            onClick={e => {
              e.stopPropagation();
              onDelete(project);
            }}
            className="text-gray-400 hover:text-red-400"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
export default ProjectRow;
