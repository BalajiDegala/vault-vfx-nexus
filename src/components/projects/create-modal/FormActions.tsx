
import React from "react";
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  loading: boolean;
  onCancel: () => void;
}

const FormActions: React.FC<FormActionsProps> = ({
  loading,
  onCancel,
}) => {
  return (
    <div className="flex justify-end gap-2 pt-4">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Project"}
      </Button>
    </div>
  );
};

export default FormActions;
