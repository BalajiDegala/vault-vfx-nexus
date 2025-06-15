
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProjectDetailsSectionProps {
  deadline: string;
  projectType: string;
  securityLevel: string;
  onDeadlineChange: (value: string) => void;
  onProjectTypeChange: (value: string) => void;
  onSecurityLevelChange: (value: string) => void;
}

const ProjectDetailsSection: React.FC<ProjectDetailsSectionProps> = ({
  deadline,
  projectType,
  securityLevel,
  onDeadlineChange,
  onProjectTypeChange,
  onSecurityLevelChange,
}) => {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="deadline">Deadline</Label>
          <Input
            id="deadline"
            type="date"
            value={deadline}
            onChange={(e) => onDeadlineChange(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="project_type">Project Type</Label>
          <Select value={projectType} onValueChange={onProjectTypeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vfx">VFX</SelectItem>
              <SelectItem value="animation">Animation</SelectItem>
              <SelectItem value="compositing">Compositing</SelectItem>
              <SelectItem value="modeling">Modeling</SelectItem>
              <SelectItem value="rigging">Rigging</SelectItem>
              <SelectItem value="lighting">Lighting</SelectItem>
              <SelectItem value="texturing">Texturing</SelectItem>
              <SelectItem value="simulation">Simulation</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="security_level">Security Level</Label>
        <Select value={securityLevel} onValueChange={onSecurityLevelChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Standard">Standard</SelectItem>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Confidential">Confidential</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

export default ProjectDetailsSection;
