
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Clock, FileText, User } from 'lucide-react';
import { useTaskBids } from '@/hooks/useTaskBids';
import { Database } from '@/integrations/supabase/types';

type Task = Database["public"]["Tables"]["tasks"]["Row"];

interface TaskBiddingModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  onBidSubmitted?: () => void;
}

const TaskBiddingModal = ({ isOpen, onClose, task, onBidSubmitted }: TaskBiddingModalProps) => {
  const { submitBid, submitting } = useTaskBids(task.id);
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'V3C',
    timeline_days: '',
    proposal: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.timeline_days || !formData.proposal) {
      return;
    }

    try {
      await submitBid({
        task_id: task.id,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        timeline_days: parseInt(formData.timeline_days),
        proposal: formData.proposal,
      });

      setFormData({
        amount: '',
        currency: 'V3C',
        timeline_days: '',
        proposal: ''
      });

      onBidSubmitted?.();
      onClose();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-blue-500/20 max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Bid on Task: {task.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Task Details */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h3 className="text-blue-400 font-medium mb-3 flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Task Details
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Type:</span>
                <Badge variant="outline" className="text-blue-400">
                  {task.task_type}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Priority:</span>
                <Badge variant="outline" className={getPriorityColor(task.priority)}>
                  {task.priority}
                </Badge>
              </div>
              {task.estimated_hours && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Estimated Hours:</span>
                  <span className="text-white">{task.estimated_hours}h</span>
                </div>
              )}
              {task.description && (
                <div className="mt-3">
                  <span className="text-gray-300 block mb-1">Description:</span>
                  <p className="text-white text-sm bg-gray-800/50 p-2 rounded">
                    {task.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Bid Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300 flex items-center">
                  <DollarSign className="h-4 w-4 mr-2 text-green-400" />
                  Bid Amount *
                </Label>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="bg-gray-800/50 border-gray-600 text-white"
                  placeholder="Enter your bid amount"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Currency</Label>
                <Select value={formData.currency} onValueChange={(value) => setFormData({...formData, currency: value})}>
                  <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="V3C">V3 Coins (V3C)</SelectItem>
                    <SelectItem value="USD">US Dollars (USD)</SelectItem>
                    <SelectItem value="EUR">Euros (EUR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300 flex items-center">
                <Clock className="h-4 w-4 mr-2 text-blue-400" />
                Timeline (Days) *
              </Label>
              <Input
                type="number"
                value={formData.timeline_days}
                onChange={(e) => setFormData({...formData, timeline_days: e.target.value})}
                className="bg-gray-800/50 border-gray-600 text-white"
                placeholder="How many days to complete?"
                min="1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300 flex items-center">
                <User className="h-4 w-4 mr-2 text-purple-400" />
                Proposal *
              </Label>
              <Textarea
                value={formData.proposal}
                onChange={(e) => setFormData({...formData, proposal: e.target.value})}
                className="bg-gray-800/50 border-gray-600 text-white min-h-32"
                placeholder="Describe your approach, experience, and why you're the best fit for this task..."
                required
              />
            </div>

            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <h4 className="text-green-400 font-medium mb-2">Bid Summary</h4>
              <div className="text-sm text-gray-300 space-y-1">
                <p>Amount: {formData.amount ? `${formData.amount} ${formData.currency}` : "Not specified"}</p>
                <p>Timeline: {formData.timeline_days ? `${formData.timeline_days} days` : "Not specified"}</p>
                <p className="text-gray-400 text-xs mt-2">
                  Your bid will be visible to the studio. Make sure to provide competitive pricing and realistic timelines.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
              >
                {submitting ? "Submitting..." : "Submit Bid"}
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskBiddingModal;
