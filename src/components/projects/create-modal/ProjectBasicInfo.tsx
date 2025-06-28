
import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ProjectBasicInfoProps {
  title: string;
  description: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
}

const ProjectBasicInfo: React.FC<ProjectBasicInfoProps> = ({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title" className="text-sm font-medium text-gray-200 mb-2 block">
          Project Title <span className="text-red-400">*</span>
        </Label>
        <Input
          id="title"
          type="text"
          placeholder="Enter project title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          required
          className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <Label htmlFor="description" className="text-sm font-medium text-gray-200 mb-2 block">
          Description
        </Label>
        <Textarea
          id="description"
          placeholder="Describe your project"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={4}
          className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 resize-none"
        />
      </div>
    </div>
  );
};

export default ProjectBasicInfo;
