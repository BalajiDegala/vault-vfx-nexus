
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FileText } from "lucide-react";
import { ProjectTemplate } from "@/types/projectTemplates";
import ProjectTemplateModal from "./ProjectTemplateModal";
import ProjectBasicInfo from "./create-modal/ProjectBasicInfo";
import ProjectBudgetSection from "./create-modal/ProjectBudgetSection";
import ProjectDetailsSection from "./create-modal/ProjectDetailsSection";
import ProjectSkillsSection from "./create-modal/ProjectSkillsSection";
import ProjectMilestonesSection from "./create-modal/ProjectMilestonesSection";

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

            <ProjectBasicInfo
              title={formData.title}
              description={formData.description}
              onTitleChange={(value) => setFormData({ ...formData, title: value })}
              onDescriptionChange={(value) => setFormData({ ...formData, description: value })}
            />

            <ProjectBudgetSection
              budgetMin={formData.budget_min}
              budgetMax={formData.budget_max}
              currency={formData.currency}
              onBudgetMinChange={(value) => setFormData({ ...formData, budget_min: value })}
              onBudgetMaxChange={(value) => setFormData({ ...formData, budget_max: value })}
              onCurrencyChange={(value) => setFormData({ ...formData, currency: value })}
            />

            <ProjectDetailsSection
              deadline={formData.deadline}
              projectType={formData.project_type}
              securityLevel={formData.security_level}
              onDeadlineChange={(value) => setFormData({ ...formData, deadline: value })}
              onProjectTypeChange={(value) => setFormData({ ...formData, project_type: value })}
              onSecurityLevelChange={(value) => setFormData({ ...formData, security_level: value })}
            />

            <ProjectSkillsSection
              skillsRequired={formData.skills_required}
              skillInput={skillInput}
              onSkillInputChange={setSkillInput}
              onAddSkill={addSkill}
              onRemoveSkill={removeSkill}
            />

            <ProjectMilestonesSection milestones={formData.milestones} />

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
