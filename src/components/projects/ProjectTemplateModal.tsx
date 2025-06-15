
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, DollarSign, Shield, Users, FileTemplate } from "lucide-react";
import { ProjectTemplate, DEFAULT_TEMPLATES } from "@/types/projectTemplates";

interface ProjectTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: ProjectTemplate) => void;
}

const ProjectTemplateModal: React.FC<ProjectTemplateModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { value: 'all', label: 'All Templates' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'feature_film', label: 'Feature Film' },
    { value: 'tv_show', label: 'TV Show' },
    { value: 'music_video', label: 'Music Video' },
    { value: 'documentary', label: 'Documentary' },
    { value: 'short_film', label: 'Short Film' },
  ];

  const filteredTemplates = selectedCategory === 'all' 
    ? DEFAULT_TEMPLATES 
    : DEFAULT_TEMPLATES.filter(template => template.category === selectedCategory);

  const handleSelectTemplate = (template: ProjectTemplate) => {
    onSelectTemplate(template);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileTemplate className="h-5 w-5" />
            Choose Project Template
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.value)}
              >
                {category.label}
              </Button>
            ))}
          </div>

          {/* Templates Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <Card 
                key={template.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow border-gray-700 bg-gray-800/50"
                onClick={() => handleSelectTemplate(template)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge variant="secondary" className="capitalize">
                      {template.category.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400">{template.description}</p>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {/* Budget */}
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-green-400" />
                    <span>${template.defaultBudgetRange.min.toLocaleString()} - ${template.defaultBudgetRange.max.toLocaleString()}</span>
                  </div>

                  {/* Timeline */}
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-blue-400" />
                    <span>{template.defaultTimeline} days</span>
                  </div>

                  {/* Security Level */}
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-purple-400" />
                    <span>{template.securityLevel}</span>
                  </div>

                  <Separator className="bg-gray-700" />

                  {/* Skills */}
                  <div>
                    <p className="text-xs text-gray-400 mb-2">Required Skills:</p>
                    <div className="flex flex-wrap gap-1">
                      {template.requiredSkills.slice(0, 3).map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {template.requiredSkills.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.requiredSkills.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Milestones */}
                  <div>
                    <p className="text-xs text-gray-400 mb-2">Milestones:</p>
                    <div className="space-y-1">
                      {template.defaultMilestones.slice(0, 2).map((milestone) => (
                        <div key={milestone.name} className="flex items-center gap-2 text-xs">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>{milestone.name} ({milestone.percentage}%)</span>
                        </div>
                      ))}
                      {template.defaultMilestones.length > 2 && (
                        <div className="text-xs text-gray-400">
                          +{template.defaultMilestones.length - 2} more milestones
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No templates found for this category.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectTemplateModal;
