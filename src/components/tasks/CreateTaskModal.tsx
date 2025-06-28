
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import { useTasks } from "@/hooks/useTasks";
import { Database } from "@/integrations/supabase/types";
import logger from "@/lib/logger";

type TaskInsert = Database["public"]["Tables"]["tasks"]["Insert"];

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  shotId: string;
  shotName: string;
  onSuccess?: () => void;
}

const CreateTaskModal = ({ isOpen, onClose, shotId, shotName, onSuccess }: CreateTaskModalProps) => {
  const { createTask } = useTasks();
  const [formData, setFormData] = useState<Omit<TaskInsert, 'shot_id'>>({
    name: '',
    description: '',
    task_type: 'modeling',
    priority: 'medium',
    status: 'todo',
    estimated_hours: undefined,
  });
  const [submitting, setSubmitting] = useState(false);

  const taskTypes = [
    { value: 'modeling', label: 'Modeling' },
    { value: 'animation', label: 'Animation' },
    { value: 'lighting', label: 'Lighting' },
    { value: 'compositing', label: 'Compositing' },
    { value: 'rendering', label: 'Rendering' },
    { value: 'fx', label: 'FX/Simulation' },
    { value: 'tracking', label: 'Tracking' },
    { value: 'rotomation', label: 'Rotomation' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'bg-green-500' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
    { value: 'high', label: 'High', color: 'bg-orange-500' },
    { value: 'critical', label: 'Critical', color: 'bg-red-500' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.task_type) return;

    try {
      setSubmitting(true);
      await createTask({
        ...formData,
        shot_id: shotId
      });

      // Reset form
      setFormData({
        name: '',
        description: '',
        task_type: 'modeling',
        priority: 'medium',
        status: 'todo',
        estimated_hours: undefined,
      });

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (error) {
      logger.error('Error creating task:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-blue-500/20 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Create New Task
          </DialogTitle>
          <p className="text-gray-400">Shot: {shotName}</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label className="text-gray-300">Task Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="bg-gray-800/50 border-gray-600 text-white"
              placeholder="e.g., Character modeling, Environment lighting..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Task Type *</Label>
              <Select 
                value={formData.task_type} 
                onValueChange={(value) => setFormData({...formData, task_type: value})}
              >
                <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {taskTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Priority</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value) => setFormData({...formData, priority: value})}
              >
                <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${priority.color}`} />
                        {priority.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Estimated Hours</Label>
            <Input
              type="number"
              value={formData.estimated_hours || ''}
              onChange={(e) => setFormData({...formData, estimated_hours: e.target.value ? parseInt(e.target.value) : undefined})}
              className="bg-gray-800/50 border-gray-600 text-white"
              placeholder="e.g., 8"
              min="1"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Description</Label>
            <Textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="bg-gray-800/50 border-gray-600 text-white min-h-24"
              placeholder="Detailed description of the task requirements..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={submitting || !formData.name || !formData.task_type}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              {submitting ? "Creating..." : "Create Task"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskModal;
