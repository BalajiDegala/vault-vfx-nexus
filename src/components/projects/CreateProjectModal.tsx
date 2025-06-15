
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, X, FileText } from "lucide-react";
import { ProjectTemplate } from "@/types/projectTemplates";
import ProjectTemplateModal from "./ProjectTemplateModal";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budget_min: "",
    budget_max: "",
    currency: "V3C",
    deadline: "",
    project_type: "studio",
    security_level: "Standard",
    skills_required: [] as string[],
    milestones: [] as Array<{ name: string; percentage: number; description: string }>,
  });
  const [skillInput, setSkillInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const { toast } = useToast();

  const handleSelectTemplate = (template: ProjectTemplate) => {
    setFormData({
      title: template.name,
      description: template.description,
      budget_min: template.defaultBudgetRange.min.toString(),
      budget_max: template.defaultBudgetRange.max.toString(),
      currency: "V3C",
      deadline: new Date(Date.now() + template.defaultTimeline * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      project_type: "studio",
      security_level: template.securityLevel,
      skills_required: [...template.requiredSkills],
      milestones: [...template.defaultMilestones],
    });
  };

  const addSkill = (skill: string) => {
    if (skill && !formData.skills_required.includes(skill)) {
      setFormData({
        ...formData,
        skills_required: [...formData.skills_required, skill],
      });
    }
    setSkillInput("");
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills_required: formData.skills_required.filter(skill => skill !== skillToRemove),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Project title is required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const projectData = {
        title: formData.title,
        description: formData.description || null,
        client_id: user.id,
        budget_min: formData.budget_min ? parseFloat(formData.budget_min) : null,
        budget_max: formData.budget_max ? parseFloat(formData.budget_max) : null,
        currency: formData.currency,
        deadline: formData.deadline || null,
        project_type: formData.project_type,
        security_level: formData.security_level,
        skills_required: formData.skills_required.length > 0 ? formData.skills_required : null,
        status: "draft" as const,
        milestones: formData.milestones.length > 0 ? formData.milestones : null,
      };

      const { error } = await supabase.from("projects").insert(projectData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Project created successfully!",
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        budget_min: "",
        budget_max: "",
        currency: "V3C",
        deadline: "",
        project_type: "studio",
        security_level: "Standard",
        skills_required: [],
        milestones: [],
      });

      onSuccess();
    } catch (error: any) {
      console.error("Error creating project:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create project",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Template Selection */}
            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowTemplateModal(true)}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Use Template
              </Button>
            </div>

            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Project Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter project title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your project"
                  rows={3}
                />
              </div>
            </div>

            {/* Budget */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="budget_min">Min Budget</Label>
                <Input
                  id="budget_min"
                  type="number"
                  value={formData.budget_min}
                  onChange={(e) => setFormData({ ...formData, budget_min: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="budget_max">Max Budget</Label>
                <Input
                  id="budget_max"
                  type="number"
                  value={formData.budget_max}
                  onChange={(e) => setFormData({ ...formData, budget_max: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="V3C">V3C</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Project Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="project_type">Project Type</Label>
                <Select value={formData.project_type} onValueChange={(value) => setFormData({ ...formData, project_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="studio">Studio</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                    <SelectItem value="test">Test</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Security Level */}
            <div>
              <Label htmlFor="security_level">Security Level</Label>
              <Select value={formData.security_level} onValueChange={(value) => setFormData({ ...formData, security_level: value })}>
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

            {/* Skills */}
            <div>
              <Label>Skills Required</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="Add a skill..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkill(skillInput);
                    }
                  }}
                />
                <Button type="button" onClick={() => addSkill(skillInput)} disabled={!skillInput}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {formData.skills_required.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.skills_required.map((skill) => (
                    <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSkill(skill)}
                        className="p-0 h-auto text-white hover:text-red-300"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Milestones */}
            {formData.milestones.length > 0 && (
              <div>
                <Label>Project Milestones</Label>
                <div className="space-y-2 mt-2">
                  {formData.milestones.map((milestone, index) => (
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
            )}

            {/* Submit */}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ProjectTemplateModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onSelectTemplate={handleSelectTemplate}
      />
    </>
  );
};

export default CreateProjectModal;
