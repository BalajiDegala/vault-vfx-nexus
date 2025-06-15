
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateProjectForm } from "@/hooks/useCreateProjectForm";
import TemplateSection from "./create-modal/TemplateSection";
import ProjectBasicInfo from "./create-modal/ProjectBasicInfo";
import ProjectBudgetSection from "./create-modal/ProjectBudgetSection";
import ProjectDetailsSection from "./create-modal/ProjectDetailsSection";
import ProjectSkillsSection from "./create-modal/ProjectSkillsSection";
import ProjectMilestonesSection from "./create-modal/ProjectMilestonesSection";
import FormActions from "./create-modal/FormActions";

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
  const {
    formData,
    setFormData,
    skillInput,
    setSkillInput,
    loading,
    handleSelectTemplate,
    addSkill,
    removeSkill,
    handleSubmit,
  } = useCreateProjectForm(onSuccess);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <TemplateSection onSelectTemplate={handleSelectTemplate} />

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

          <FormActions loading={loading} onCancel={onClose} />
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectModal;
