
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { ProjectTemplate } from "@/types/projectTemplates";
import ProjectTemplateModal from "../ProjectTemplateModal";

interface TemplateSectionProps {
  onSelectTemplate: (template: ProjectTemplate) => void;
}

const TemplateSection: React.FC<TemplateSectionProps> = ({
  onSelectTemplate,
}) => {
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  const handleSelectTemplate = (template: ProjectTemplate) => {
    onSelectTemplate(template);
    setShowTemplateModal(false);
  };

  return (
    <>
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

      <ProjectTemplateModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onSelectTemplate={handleSelectTemplate}
      />
    </>
  );
};

export default TemplateSection;
