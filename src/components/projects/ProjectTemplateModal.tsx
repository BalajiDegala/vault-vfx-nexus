
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
import { Clock, DollarSign, Shield, Users, FileText } from "lucide-react";
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
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-white border-gray-300">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900">
            <FileText className="h-5 w-5" />
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
                className={selectedCategory === category.value 
                  ? "bg-blue-600 hover:bg-blue-700 text-white" 
                  : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                }
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
                className="cursor-pointer hover:shadow-lg transition-shadow border-gray-300 bg-white hover:border-blue-400"
                onClick={() => handleSelectTemplate(template)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg text-gray-900">{template.name}</CardTitle>
                    <Badge variant="secondary" className="capitalize bg-gray-100 text-gray-800">
                      {template.category.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{template.description}</p>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {/* Budget */}
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span>${template.defaultBudgetRange.min.toLocaleString()} - ${template.defaultBudgetRange.max.toLocaleString()}</span>
                  </div>

                  {/* Timeline */}
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span>{template.defaultTimeline} days</span>
                  </div>

                  {/* Security Level */}
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Shield className="h-4 w-4 text-purple-600" />
                    <span>{template.securityLevel}</span>
                  </div>

                  <Separator className="bg-gray-200" />

                  {/* Skills */}
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Required Skills:</p>
                    <div className="flex flex-wrap gap-1">
                      {template.requiredSkills.slice(0, 3).map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs border-gray-300 text-gray-700">
                          {skill}
                        </Badge>
                      ))}
                      {template.requiredSkills.length > 3 && (
                        <Badge variant="outline" className="text-xs border-gray-300 text-gray-700">
                          +{template.requiredSkills.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Milestones */}
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Milestones:</p>
                    <div className="space-y-1">
                      {template.defaultMilestones.slice(0, 2).map((milestone) => (
                        <div key={milestone.name} className="flex items-center gap-2 text-xs text-gray-600">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>{milestone.name} ({milestone.percentage}%)</span>
                        </div>
                      ))}
                      {template.defaultMilestones.length > 2 && (
                        <div className="text-xs text-gray-500">
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
            <div className="text-center py-8 text-gray-500">
              No templates found for this category.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectTemplateModal;
