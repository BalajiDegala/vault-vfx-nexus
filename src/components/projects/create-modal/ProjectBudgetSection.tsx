
import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ProjectBudgetSectionProps {
  budgetMin: number;
  budgetMax: number;
  currency: string;
  onBudgetMinChange: (value: number) => void;
  onBudgetMaxChange: (value: number) => void;
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
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="budgetMin" className="text-sm font-medium text-gray-200 mb-2 block">
            Min Budget
          </Label>
          <Input
            id="budgetMin"
            type="number"
            placeholder="0"
            value={budgetMin}
            onChange={(e) => onBudgetMinChange(Number(e.target.value))}
            className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <Label htmlFor="budgetMax" className="text-sm font-medium text-gray-200 mb-2 block">
            Max Budget
          </Label>
          <Input
            id="budgetMax"
            type="number"
            placeholder="0"
            value={budgetMax}
            onChange={(e) => onBudgetMaxChange(Number(e.target.value))}
            className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <Label htmlFor="currency" className="text-sm font-medium text-gray-200 mb-2 block">
            Currency
          </Label>
          <Select value={currency} onValueChange={onCurrencyChange}>
            <SelectTrigger className="bg-gray-800 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              <SelectItem value="V3C" className="text-white hover:bg-gray-700">V3C</SelectItem>
              <SelectItem value="USD" className="text-white hover:bg-gray-700">USD</SelectItem>
              <SelectItem value="EUR" className="text-white hover:bg-gray-700">EUR</SelectItem>
              <SelectItem value="GBP" className="text-white hover:bg-gray-700">GBP</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default ProjectBudgetSection;
