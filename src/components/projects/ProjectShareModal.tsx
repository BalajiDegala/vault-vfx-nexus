
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Share2, Users, Shield } from 'lucide-react';
import { useProjectShares } from '@/hooks/useProjectShares';
import { useUserSearch } from '@/hooks/useUserSearch';
import { Database } from '@/integrations/supabase/types';

type Project = Database["public"]["Tables"]["projects"]["Row"];

interface ProjectShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onShareSubmitted?: () => void;
}

const ProjectShareModal = ({ isOpen, onClose, project, onShareSubmitted }: ProjectShareModalProps) => {
  const { shareProject } = useProjectShares();
  const { searchUsers, searchResults, loading: searchLoading } = useUserSearch();
  const [formData, setFormData] = useState({
    studio_id: '',
    access_level: 'view' as 'view' | 'bid' | 'full',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.studio_id) {
      return;
    }

    try {
      setSubmitting(true);
      await shareProject({
        project_id: project.id,
        studio_id: formData.studio_id,
        access_level: formData.access_level,
        notes: formData.notes || undefined,
      });

      setFormData({
        studio_id: '',
        access_level: 'view',
        notes: ''
      });

      onShareSubmitted?.();
      onClose();
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setSubmitting(false);
    }
  };

  const handleStudioSearch = (query: string) => {
    if (query.length > 2) {
      searchUsers(query, 'studio');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-blue-500/20 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Share Project: {project.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Project Info */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h3 className="text-blue-400 font-medium mb-3 flex items-center">
              <Share2 className="h-4 w-4 mr-2" />
              Project Details
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Status:</span>
                <Badge variant="outline" className="text-blue-400">
                  {project.status?.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              {project.budget_min && project.budget_max && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Budget Range:</span>
                  <span className="text-green-400">
                    {project.budget_min} - {project.budget_max} {project.currency}
                  </span>
                </div>
              )}
              {project.description && (
                <div className="mt-3">
                  <span className="text-gray-300 block mb-1">Description:</span>
                  <p className="text-white text-sm bg-gray-800/50 p-2 rounded line-clamp-3">
                    {project.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Share Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-300 flex items-center">
                <Users className="h-4 w-4 mr-2 text-blue-400" />
                Select Studio *
              </Label>
              <Select 
                value={formData.studio_id} 
                onValueChange={(value) => setFormData({...formData, studio_id: value})}
                onOpenChange={(open) => {
                  if (open) {
                    searchUsers('', 'studio');
                  }
                }}
              >
                <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                  <SelectValue placeholder="Search and select a studio..." />
                </SelectTrigger>
                <SelectContent>
                  {searchResults.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center space-x-2">
                        <span>{user.first_name} {user.last_name}</span>
                        <span className="text-xs text-gray-400">(@{user.username})</span>
                      </div>
                    </SelectItem>
                  ))}
                  {searchResults.length === 0 && (
                    <SelectItem value="no-results" disabled>
                      No studios found
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300 flex items-center">
                <Shield className="h-4 w-4 mr-2 text-purple-400" />
                Access Level
              </Label>
              <Select 
                value={formData.access_level} 
                onValueChange={(value: 'view' | 'bid' | 'full') => setFormData({...formData, access_level: value})}
              >
                <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">View Only - Can see project details</SelectItem>
                  <SelectItem value="bid">Bidding Access - Can view and bid on project</SelectItem>
                  <SelectItem value="full">Full Access - Can view, bid, and manage tasks</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">
                Additional Notes
              </Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="bg-gray-800/50 border-gray-600 text-white min-h-24"
                placeholder="Add any specific instructions or requirements for this studio..."
              />
            </div>

            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <h4 className="text-green-400 font-medium mb-2">Share Summary</h4>
              <div className="text-sm text-gray-300 space-y-1">
                <p>Project: {project.title}</p>
                <p>Access Level: {formData.access_level}</p>
                <p className="text-gray-400 text-xs mt-2">
                  The studio will be notified about this shared project and can respond based on the access level you've granted.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={submitting || !formData.studio_id}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                {submitting ? "Sharing..." : "Share Project"}
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

export default ProjectShareModal;
