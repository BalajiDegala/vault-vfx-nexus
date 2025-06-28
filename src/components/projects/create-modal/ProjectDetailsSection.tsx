
import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

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
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="deadline" className="text-sm font-medium text-gray-200 mb-2 block">
            Deadline
          </Label>
          <Input
            id="deadline"
            type="date"
            value={deadline}
            onChange={(e) => onDeadlineChange(e.target.value)}
            className="bg-gray-800 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <Label htmlFor="projectType" className="text-sm font-medium text-gray-200 mb-2 block">
            Project Type
          </Label>
          <Select value={projectType} onValueChange={onProjectTypeChange}>
            <SelectTrigger className="bg-gray-800 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500">
              <SelectValue placeholder="Select project type" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              <SelectItem value="studio" className="text-white hover:bg-gray-700">Studio Project</SelectItem>
              <SelectItem value="personal" className="text-white hover:bg-gray-700">Personal Project</SelectItem>
              <SelectItem value="freelance" className="text-white hover:bg-gray-700">Freelance Project</SelectItem>
              <SelectItem value="test" className="text-white hover:bg-gray-700">Test Project</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <Label htmlFor="securityLevel" className="text-sm font-medium text-gray-200 mb-2 block">
          Security Level
        </Label>
        <Select value={securityLevel} onValueChange={onSecurityLevelChange}>
          <SelectTrigger className="bg-gray-800 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500">
            <SelectValue placeholder="Select security level" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-600">
            <SelectItem value="Standard" className="text-white hover:bg-gray-700">Standard</SelectItem>
            <SelectItem value="High" className="text-white hover:bg-gray-700">High</SelectItem>
            <SelectItem value="Confidential" className="text-white hover:bg-gray-700">Confidential</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ProjectDetailsSection;
