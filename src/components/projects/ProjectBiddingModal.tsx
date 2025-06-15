
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Clock, FileText, Briefcase } from 'lucide-react';
import { useProjectBids } from '@/hooks/useProjectBids';
import { Database } from '@/integrations/supabase/types';

type Project = Database["public"]["Tables"]["projects"]["Row"];

interface ProjectBiddingModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onBidSubmitted?: () => void;
}

const ProjectBiddingModal = ({ isOpen, onClose, project, onBidSubmitted }: ProjectBiddingModalProps) => {
  const { submitProjectBid, submitting } = useProjectBids(project.id);
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
      await submitProjectBid({
        project_id: project.id,
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'in_progress':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'completed':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-blue-500/20 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            Bid on Project: {project.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Project Details */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h3 className="text-blue-400 font-medium mb-3 flex items-center">
              <Briefcase className="h-4 w-4 mr-2" />
              Project Details
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Status:</span>
                <Badge variant="outline" className={getStatusColor(project.status)}>
                  {project.status?.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Type:</span>
                <Badge variant="outline" className="text-blue-400">
                  {project.project_type}
                </Badge>
              </div>
              {project.budget_min && project.budget_max && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Client Budget Range:</span>
                  <span className="text-green-400">
                    {project.budget_min} - {project.budget_max} {project.currency}
                  </span>
                </div>
              )}
              {project.deadline && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Deadline:</span>
                  <span className="text-orange-400">
                    {new Date(project.deadline).toLocaleDateString()}
                  </span>
                </div>
              )}
              {project.skills_required && project.skills_required.length > 0 && (
                <div className="mt-3">
                  <span className="text-gray-300 block mb-2">Required Skills:</span>
                  <div className="flex flex-wrap gap-2">
                    {project.skills_required.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs bg-purple-500/20 text-purple-400">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {project.description && (
                <div className="mt-3">
                  <span className="text-gray-300 block mb-1">Description:</span>
                  <p className="text-white text-sm bg-gray-800/50 p-3 rounded max-h-32 overflow-y-auto">
                    {project.description}
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
                  Your Bid Amount *
                </Label>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="bg-gray-800/50 border-gray-600 text-white"
                  placeholder="Enter your project bid"
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
                Project Timeline (Days) *
              </Label>
              <Input
                type="number"
                value={formData.timeline_days}
                onChange={(e) => setFormData({...formData, timeline_days: e.target.value})}
                className="bg-gray-800/50 border-gray-600 text-white"
                placeholder="How many days to complete the entire project?"
                min="1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300 flex items-center">
                <FileText className="h-4 w-4 mr-2 text-purple-400" />
                Project Proposal *
              </Label>
              <Textarea
                value={formData.proposal}
                onChange={(e) => setFormData({...formData, proposal: e.target.value})}
                className="bg-gray-800/50 border-gray-600 text-white min-h-40"
                placeholder="Describe your approach to this project, your experience with similar work, team capabilities, deliverables, and why you're the best choice for this project..."
                required
              />
            </div>

            <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-lg p-4">
              <h4 className="text-green-400 font-medium mb-2">Project Bid Summary</h4>
              <div className="text-sm text-gray-300 space-y-1">
                <p>Total Project Cost: {formData.amount ? `${formData.amount} ${formData.currency}` : "Not specified"}</p>
                <p>Project Timeline: {formData.timeline_days ? `${formData.timeline_days} days` : "Not specified"}</p>
                <p className="text-gray-400 text-xs mt-2">
                  This bid covers the entire project scope. Make sure your proposal addresses all project requirements and deliverables.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
              >
                {submitting ? "Submitting..." : "Submit Project Bid"}
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

export default ProjectBiddingModal;
