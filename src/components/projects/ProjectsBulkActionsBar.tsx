
import React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProjectsBulkActionsBarProps {
  selectedCount: number;
  onDelete: () => void;
  onDeselectAll: () => void;
}

const ProjectsBulkActionsBar: React.FC<ProjectsBulkActionsBarProps> = ({
  selectedCount,
  onDelete,
  onDeselectAll,
}) => (
  <div className="flex items-center gap-4 mb-2 bg-blue-950/85 rounded-md border border-blue-700 px-3 py-2 shadow-lg">
    <span className="font-medium text-blue-200">{selectedCount} selected</span>
    <Button
      size="sm"
      variant="destructive"
      className="gap-1"
      onClick={onDelete}
    >
      <Trash2 className="w-4 h-4" />
      Delete Selected
    </Button>
    <Button
      size="sm"
      variant="secondary"
      onClick={onDeselectAll}
    >
      Deselect All
    </Button>
  </div>
);

export default ProjectsBulkActionsBar;
