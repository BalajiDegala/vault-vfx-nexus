
import React from "react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface Milestone {
  name: string;
  percentage: number;
  description: string;
}

interface ProjectMilestonesSectionProps {
  milestones: Milestone[];
}

const ProjectMilestonesSection: React.FC<ProjectMilestonesSectionProps> = ({
  milestones,
}) => {
  if (milestones.length === 0) return null;

  return (
    <div>
      <Label>Project Milestones</Label>
      <div className="space-y-2 mt-2">
        {milestones.map((milestone, index) => (
          <div key={index} className="bg-gray-800/50 p-3 rounded border border-gray-700">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{milestone.name}</h4>
                <p className="text-sm text-gray-400">{milestone.description}</p>
              </div>
              <Badge variant="outline">{milestone.percentage}%</Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectMilestonesSection;
