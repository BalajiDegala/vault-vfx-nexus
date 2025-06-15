import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Filter, 
  X, 
  Save, 
  Trash2,
  Calendar,
  DollarSign,
  Users,
  Shield,
  Tag
} from "lucide-react";
import { AdvancedFilters, SavedFilterPreset } from "@/types/advancedFilters";

interface AdvancedFiltersModalProps {
  filters: AdvancedFilters;
  onFiltersChange: (filters: Partial<AdvancedFilters>) => void;
  onClearAll: () => void;
  activeFiltersCount: number;
  savedPresets: SavedFilterPreset[];
  onSavePreset: (name: string) => void;
  onLoadPreset: (preset: SavedFilterPreset) => void;
  onDeletePreset: (presetId: string) => void;
}

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "open", label: "Open" },
  { value: "completed", label: "Completed" },
  { value: "draft", label: "Draft" },
  { value: "cancelled", label: "Cancelled" },
  { value: "review", label: "Review" },
  { value: "in_progress", label: "In Progress" },
];

const typeOptions = [
  { value: "all", label: "All Types" },
  { value: "studio", label: "Studio" },
  { value: "personal", label: "Personal" },
  { value: "freelance", label: "Freelance" },
  { value: "test", label: "Test" },
];

const assignedOptions = [
  { value: "all", label: "All Projects" },
  { value: "assigned", label: "Assigned" },
  { value: "unassigned", label: "Unassigned" },
];

const securityLevelOptions = [
  { value: "all", label: "All Levels" },
  { value: "Standard", label: "Standard" },
  { value: "High", label: "High" },
  { value: "Confidential", label: "Confidential" },
];

const skillSuggestions = [
  "3D Animation", "VFX", "Compositing", "Motion Graphics", "Modeling",
  "Texturing", "Lighting", "Rendering", "Simulation", "Tracking"
];

const AdvancedFiltersModal: React.FC<AdvancedFiltersModalProps> = ({
  filters,
  onFiltersChange,
  onClearAll,
  activeFiltersCount,
  savedPresets,
  onSavePreset,
  onLoadPreset,
  onDeletePreset,
}) => {
  const [open, setOpen] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [skillInput, setSkillInput] = useState("");

  const addSkill = (skill: string) => {
    if (skill && !filters.skillsFilter.includes(skill)) {
      onFiltersChange({
        skillsFilter: [...filters.skillsFilter, skill]
      });
    }
    setSkillInput("");
  };

  const removeSkill = (skillToRemove: string) => {
    onFiltersChange({
      skillsFilter: filters.skillsFilter.filter(skill => skill !== skillToRemove)
    });
  };

  const handleSavePreset = () => {
    if (presetName.trim()) {
      onSavePreset(presetName.trim());
      setPresetName("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
          <Filter className="h-4 w-4 mr-2" />
          Advanced Filters
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2 bg-blue-600 text-white">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Advanced Filters</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Saved Presets */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Saved Filter Presets</Label>
            <div className="flex flex-wrap gap-2">
              {savedPresets.map((preset) => (
                <div key={preset.id} className="flex items-center gap-1 bg-gray-800 rounded-lg p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onLoadPreset(preset)}
                    className="text-xs"
                  >
                    {preset.name}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeletePreset(preset.id)}
                    className="text-red-400 hover:text-red-300 p-1"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
            
            {/* Save new preset */}
            <div className="flex gap-2">
              <Input
                placeholder="Preset name..."
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                className="bg-gray-800 border-gray-700"
              />
              <Button onClick={handleSavePreset} disabled={!presetName.trim()}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Status
            </Label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map(option => (
                <label
                  key={option.value}
                  className={`flex items-center gap-2 px-3 py-2 rounded cursor-pointer border
                    ${filters.statusFilter.includes(option.value) 
                      ? "bg-blue-800/40 border-blue-600" 
                      : "bg-gray-800 border-gray-700"}`}
                >
                  <input
                    type="checkbox"
                    checked={filters.statusFilter.includes(option.value)}
                    onChange={e => {
                      if (e.target.checked) {
                        onFiltersChange({
                          statusFilter: option.value === "all" 
                            ? ["all"] 
                            : filters.statusFilter.filter(s => s !== "all").concat(option.value)
                        });
                      } else {
                        const filtered = filters.statusFilter.filter(s => s !== option.value);
                        onFiltersChange({
                          statusFilter: filtered.length === 0 ? ["all"] : filtered
                        });
                      }
                    }}
                    className="accent-blue-500"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Date Ranges */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Deadline Range
              </Label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={filters.deadlineRange.from || ""}
                  onChange={e => onFiltersChange({
                    deadlineRange: { ...filters.deadlineRange, from: e.target.value || null }
                  })}
                  className="bg-gray-800 border-gray-700"
                />
                <Input
                  type="date"
                  value={filters.deadlineRange.to || ""}
                  onChange={e => onFiltersChange({
                    deadlineRange: { ...filters.deadlineRange, to: e.target.value || null }
                  })}
                  className="bg-gray-800 border-gray-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Created Date Range
              </Label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={filters.createdDateRange.from || ""}
                  onChange={e => onFiltersChange({
                    createdDateRange: { ...filters.createdDateRange, from: e.target.value || null }
                  })}
                  className="bg-gray-800 border-gray-700"
                />
                <Input
                  type="date"
                  value={filters.createdDateRange.to || ""}
                  onChange={e => onFiltersChange({
                    createdDateRange: { ...filters.createdDateRange, to: e.target.value || null }
                  })}
                  className="bg-gray-800 border-gray-700"
                />
              </div>
            </div>
          </div>

          {/* Budget Range */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Budget Range
            </Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min budget"
                value={filters.budgetRange.min || ""}
                onChange={e => onFiltersChange({
                  budgetRange: { ...filters.budgetRange, min: e.target.value ? Number(e.target.value) : null }
                })}
                className="bg-gray-800 border-gray-700"
              />
              <Input
                type="number"
                placeholder="Max budget"
                value={filters.budgetRange.max || ""}
                onChange={e => onFiltersChange({
                  budgetRange: { ...filters.budgetRange, max: e.target.value ? Number(e.target.value) : null }
                })}
                className="bg-gray-800 border-gray-700"
              />
            </div>
          </div>

          {/* Skills Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Skills Required</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add skill..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addSkill(skillInput);
                  }
                }}
                className="bg-gray-800 border-gray-700"
              />
              <Button onClick={() => addSkill(skillInput)} disabled={!skillInput}>
                Add
              </Button>
            </div>
            
            {/* Skill suggestions */}
            <div className="flex flex-wrap gap-1">
              {skillSuggestions.map(skill => (
                <Button
                  key={skill}
                  variant="outline"
                  size="sm"
                  onClick={() => addSkill(skill)}
                  disabled={filters.skillsFilter.includes(skill)}
                  className="text-xs"
                >
                  {skill}
                </Button>
              ))}
            </div>

            {/* Selected skills */}
            {filters.skillsFilter.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {filters.skillsFilter.map(skill => (
                  <Badge key={skill} variant="secondary" className="bg-blue-600">
                    {skill}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSkill(skill)}
                      className="ml-1 p-0 h-auto text-white hover:text-red-300"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Additional Filters */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Project Type</Label>
              <Select value={filters.typeFilter} onValueChange={value => onFiltersChange({ typeFilter: value })}>
                <SelectTrigger className="bg-gray-800 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Assignment Status
              </Label>
              <Select value={filters.assignedFilter} onValueChange={value => onFiltersChange({ assignedFilter: value })}>
                <SelectTrigger className="bg-gray-800 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {assignedOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security Level
              </Label>
              <Select value={filters.securityLevelFilter} onValueChange={value => onFiltersChange({ securityLevelFilter: value })}>
                <SelectTrigger className="bg-gray-800 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {securityLevelOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t border-gray-700">
            <Button variant="outline" onClick={onClearAll}>
              Clear All Filters
            </Button>
            <Button onClick={() => setOpen(false)}>
              Apply Filters
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdvancedFiltersModal;
