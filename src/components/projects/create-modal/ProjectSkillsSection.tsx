
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";

interface ProjectSkillsSectionProps {
  skillsRequired: string[];
  skillInput: string;
  onSkillInputChange: (value: string) => void;
  onAddSkill: (skill: string) => void;
  onRemoveSkill: (skill: string) => void;
}

const ProjectSkillsSection: React.FC<ProjectSkillsSectionProps> = ({
  skillsRequired,
  skillInput,
  onSkillInputChange,
  onAddSkill,
  onRemoveSkill,
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onAddSkill(skillInput);
    }
  };

  return (
    <div>
      <Label>Skills Required</Label>
      <div className="flex gap-2 mt-2">
        <Input
          value={skillInput}
          onChange={(e) => onSkillInputChange(e.target.value)}
          placeholder="Add a skill..."
          onKeyPress={handleKeyPress}
        />
        <Button 
          type="button" 
          onClick={() => onAddSkill(skillInput)} 
          disabled={!skillInput}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      {skillsRequired.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {skillsRequired.map((skill) => (
            <Badge key={skill} variant="secondary" className="flex items-center gap-1">
              {skill}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onRemoveSkill(skill)}
                className="p-0 h-auto text-white hover:text-red-300"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectSkillsSection;
