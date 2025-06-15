
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ProjectTemplate } from "@/types/projectTemplates";

interface FormData {
  title: string;
  description: string;
  budget_min: string;
  budget_max: string;
  currency: string;
  deadline: string;
  project_type: string;
  security_level: string;
  skills_required: string[];
  milestones: Array<{ name: string; percentage: number; description: string }>;
}

export const useCreateProjectForm = (onSuccess: () => void) => {
  const [formData, setFormData] = useState<FormData>({
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
  const [skillInput, setSkillInput] = useState("");
  const [loading, setLoading] = useState(false);
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

  return {
    formData,
    setFormData,
    skillInput,
    setSkillInput,
    loading,
    handleSelectTemplate,
    addSkill,
    removeSkill,
    handleSubmit,
  };
};
