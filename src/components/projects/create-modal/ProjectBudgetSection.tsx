
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProjectBudgetSectionProps {
  budgetMin: string;
  budgetMax: string;
  currency: string;
  onBudgetMinChange: (value: string) => void;
  onBudgetMaxChange: (value: string) => void;
  onCurrencyChange: (value: string) => void;
}

const ProjectBudgetSection: React.FC<ProjectBudgetSectionProps> = ({
  budgetMin,
  budgetMax,
  currency,
  onBudgetMinChange,
  onBudgetMaxChange,
  onCurrencyChange,
}) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div>
        <Label htmlFor="budget_min">Min Budget</Label>
        <Input
          id="budget_min"
          type="number"
          value={budgetMin}
          onChange={(e) => onBudgetMinChange(e.target.value)}
          placeholder="0"
        />
      </div>
      <div>
        <Label htmlFor="budget_max">Max Budget</Label>
        <Input
          id="budget_max"
          type="number"
          value={budgetMax}
          onChange={(e) => onBudgetMaxChange(e.target.value)}
          placeholder="0"
        />
      </div>
      <div>
        <Label htmlFor="currency">Currency</Label>
        <Select value={currency} onValueChange={onCurrencyChange}>
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
  );
};

export default ProjectBudgetSection;
