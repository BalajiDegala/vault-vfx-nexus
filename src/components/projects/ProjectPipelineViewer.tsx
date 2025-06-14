
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import SequencesList from "./SequencesList";
import { Database } from "@/integrations/supabase/types";

type Project = Database["public"]["Tables"]["projects"]["Row"];

interface ProjectPipelineViewerProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProjectPipelineViewer: React.FC<ProjectPipelineViewerProps> = ({ project, open, onOpenChange }) => {
  if (!project) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-full">
        <DialogHeader>
          <DialogTitle>
            Pipeline: {project.title}
          </DialogTitle>
        </DialogHeader>
        <div>
          <SequencesList projectId={project.id} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectPipelineViewer;
