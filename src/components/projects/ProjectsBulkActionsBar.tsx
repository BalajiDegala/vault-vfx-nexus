
import React from "react";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Database } from "@/integrations/supabase/types";

type ProjectStatus = Database["public"]["Enums"]["project_status"];

const statusOptions: { value: ProjectStatus; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "completed", label: "Completed" },
  { value: "draft", label: "Draft" },
  { value: "cancelled", label: "Cancelled" },
  { value: "review", label: "Review" },
  { value: "in_progress", label: "In Progress" },
];

interface ProjectsBulkActionsBarProps {
  selectedCount: number;
  onDelete: () => void;
  onDeselectAll: () => void;
  onBulkStatusChange: (status: ProjectStatus) => void;
  disabled?: boolean;
}

const ProjectsBulkActionsBar: React.FC<ProjectsBulkActionsBarProps> = ({
  selectedCount,
  onDelete,
  onDeselectAll,
  onBulkStatusChange,
  disabled = false,
}) => {
  const [newStatus, setNewStatus] = useState<ProjectStatus | "">("");

  return (
    <div className="flex flex-wrap gap-2 items-center mb-2 bg-blue-950/85 rounded-md border border-blue-700 px-3 py-2 shadow-lg">
      <span className="font-medium text-blue-200">
        {selectedCount} selected
      </span>
      <Button
        size="sm"
        variant="destructive"
        className="gap-1"
        onClick={onDelete}
        disabled={disabled}
      >
        <Trash2 className="w-4 h-4" />
        Delete Selected
      </Button>
      <div className="flex gap-1 items-center">
        <select
          className="rounded border bg-gray-800 border-blue-700 text-blue-100 px-2 py-1 text-sm"
          value={newStatus}
          onChange={(e) => setNewStatus(e.target.value as ProjectStatus | "")}
        >
          <option value="">Change Status</option>
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <Button
          size="sm"
          variant="secondary"
          disabled={!newStatus || disabled}
          onClick={() => {
            if (newStatus) onBulkStatusChange(newStatus as ProjectStatus);
          }}
        >
          Apply
        </Button>
      </div>
      <Button
        size="sm"
        variant="secondary"
        onClick={onDeselectAll}
        disabled={disabled}
      >
        Deselect All
      </Button>
    </div>
  );
};

export default ProjectsBulkActionsBar;
