
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
}

const CreateProjectModal = ({ open, onClose, onSuccess, userId }: CreateProjectModalProps) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budget_min: "",
    budget_max: "",
    deadline: "",
    security_level: "Standard",
    skills_required: [] as string[],
    data_layers: [] as string[],
  });
  const [newSkill, setNewSkill] = useState("");
  const [newDataLayer, setNewDataLayer] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const skillSuggestions = [
    "3D Modeling", "Animation", "Compositing", "Motion Graphics", "VFX",
    "Lighting", "Texturing", "Rigging", "Simulation", "Rendering",
    "Color Grading", "Rotoscoping", "Matchmoving", "Concept Art"
  ];

  const dataLayerSuggestions = [
    "RGB", "Alpha", "Depth", "Normal", "Motion Vector", "Object ID",
    "Material ID", "Shadow", "Reflection", "Ambient Occlusion"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("projects")
        .insert({
          title: formData.title,
          description: formData.description,
          budget_min: parseFloat(formData.budget_min),
          budget_max: parseFloat(formData.budget_max),
          deadline: formData.deadline || null,
          security_level: formData.security_level,
          skills_required: formData.skills_required,
          data_layers: formData.data_layers,
          client_id: userId,
          status: "open",
          currency: "V3C",
        });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to create project",
          variant: "destructive",
        });
        return;
      }

      onSuccess();
      setFormData({
        title: "",
        description: "",
        budget_min: "",
        budget_max: "",
        deadline: "",
        security_level: "Standard",
        skills_required: [],
        data_layers: [],
      });
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addSkill = (skill: string) => {
    if (skill && !formData.skills_required.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        skills_required: [...prev.skills_required, skill]
      }));
    }
    setNewSkill("");
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills_required: prev.skills_required.filter(s => s !== skill)
    }));
  };

  const addDataLayer = (layer: string) => {
    if (layer && !formData.data_layers.includes(layer)) {
      setFormData(prev => ({
        ...prev,
        data_layers: [...prev.data_layers, layer]
      }));
    }
    setNewDataLayer("");
  };

  const removeDataLayer = (layer: string) => {
    setFormData(prev => ({
      ...prev,
      data_layers: prev.data_layers.filter(l => l !== layer)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-900 border-blue-500/20">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            Create New Project
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-gray-300">Project Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
              className="bg-gray-800/50 border-gray-600 text-white"
              placeholder="Enter project title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-300">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="bg-gray-800/50 border-gray-600 text-white min-h-[100px]"
              placeholder="Describe your project requirements..."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget_min" className="text-gray-300">Minimum Budget (V3C) *</Label>
              <Input
                id="budget_min"
                type="number"
                value={formData.budget_min}
                onChange={(e) => setFormData(prev => ({ ...prev, budget_min: e.target.value }))}
                required
                className="bg-gray-800/50 border-gray-600 text-white"
                placeholder="1000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget_max" className="text-gray-300">Maximum Budget (V3C) *</Label>
              <Input
                id="budget_max"
                type="number"
                value={formData.budget_max}
                onChange={(e) => setFormData(prev => ({ ...prev, budget_max: e.target.value }))}
                required
                className="bg-gray-800/50 border-gray-600 text-white"
                placeholder="5000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline" className="text-gray-300">Deadline</Label>
            <Input
              id="deadline"
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
              className="bg-gray-800/50 border-gray-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Security Level</Label>
            <Select
              value={formData.security_level}
              onValueChange={(value) => setFormData(prev => ({ ...prev, security_level: value }))}
            >
              <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Standard">Standard</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Skills Required</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.skills_required.map((skill) => (
                <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                  {skill}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeSkill(skill)} />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add skill..."
                className="bg-gray-800/50 border-gray-600 text-white"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill(newSkill))}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => addSkill(newSkill)}
                className="border-blue-500/50"
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {skillSuggestions.map((skill) => (
                <Badge
                  key={skill}
                  variant="outline"
                  className="cursor-pointer hover:bg-blue-500/20"
                  onClick={() => addSkill(skill)}
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Data Layers Required</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.data_layers.map((layer) => (
                <Badge key={layer} variant="secondary" className="flex items-center gap-1">
                  {layer}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeDataLayer(layer)} />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newDataLayer}
                onChange={(e) => setNewDataLayer(e.target.value)}
                placeholder="Add data layer..."
                className="bg-gray-800/50 border-gray-600 text-white"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addDataLayer(newDataLayer))}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => addDataLayer(newDataLayer)}
                className="border-blue-500/50"
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {dataLayerSuggestions.map((layer) => (
                <Badge
                  key={layer}
                  variant="outline"
                  className="cursor-pointer hover:bg-blue-500/20"
                  onClick={() => addDataLayer(layer)}
                >
                  {layer}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-gray-600 text-gray-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {loading ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectModal;
