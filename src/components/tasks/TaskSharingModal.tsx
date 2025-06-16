
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Share2, Users, Shield } from "lucide-react";
import { useUserSearch } from "@/hooks/useUserSearch";
import { useSharedTasks } from "@/hooks/useSharedTasks";
import { Database } from "@/integrations/supabase/types";

type Task = Database["public"]["Tables"]["tasks"]["Row"];

interface TaskSharingModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  userRole: string;
  userId: string;
}

const TaskSharingModal = ({ isOpen, onClose, task, userRole, userId }: TaskSharingModalProps) => {
  const { searchUsers, searchResults } = useUserSearch();
  const { shareTaskWithArtist } = useSharedTasks(userRole, userId);
  const [formData, setFormData] = useState({
    artist_id: '',
    access_level: 'view' as 'view' | 'edit' | 'comment',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!task || !formData.artist_id) return;

    try {
      setSubmitting(true);
      await shareTaskWithArtist(
        task.id, 
        formData.artist_id, 
        formData.access_level, 
        formData.notes || undefined
      );

      setFormData({
        artist_id: '',
        access_level: 'view',
        notes: ''
      });

      onClose();
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setSubmitting(false);
    }
  };

  const handleArtistSearch = (query: string) => {
    if (query.length > 2) {
      searchUsers(query, 'artist');
    }
  };

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-blue-500/20 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Share Task with Artist
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Task Info */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h3 className="text-blue-400 font-medium mb-3 flex items-center">
              <Share2 className="h-4 w-4 mr-2" />
              Task Details
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Task:</span>
                <span className="text-white font-medium">{task.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Type:</span>
                <Badge variant="outline" className="text-purple-400">
                  {task.task_type}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Priority:</span>
                <Badge variant="outline" className={
                  task.priority === 'high' ? 'text-red-400' :
                  task.priority === 'medium' ? 'text-yellow-400' : 'text-green-400'
                }>
                  {task.priority}
                </Badge>
              </div>
              {task.estimated_hours && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Estimated Hours:</span>
                  <span className="text-blue-400">{task.estimated_hours}h</span>
                </div>
              )}
            </div>
          </div>

          {/* Share Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-300 flex items-center">
                <Users className="h-4 w-4 mr-2 text-blue-400" />
                Select Artist *
              </Label>
              <Select 
                value={formData.artist_id} 
                onValueChange={(value) => setFormData({...formData, artist_id: value})}
                onOpenChange={(open) => {
                  if (open) {
                    searchUsers('', 'artist');
                  }
                }}
              >
                <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                  <SelectValue placeholder="Search and select an artist..." />
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
                      No artists found
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
                onValueChange={(value: 'view' | 'edit' | 'comment') => setFormData({...formData, access_level: value})}
              >
                <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">View Only - Can see task details</SelectItem>
                  <SelectItem value="comment">Comment Access - Can view and comment</SelectItem>
                  <SelectItem value="edit">Edit Access - Can view, comment, and update</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">
                Notes for Artist
              </Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="bg-gray-800/50 border-gray-600 text-white min-h-24"
                placeholder="Add any specific instructions or requirements for this artist..."
              />
            </div>

            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <h4 className="text-green-400 font-medium mb-2">Share Summary</h4>
              <div className="text-sm text-gray-300 space-y-1">
                <p>Task: {task.name}</p>
                <p>Access Level: {formData.access_level}</p>
                <p className="text-gray-400 text-xs mt-2">
                  The artist will be notified about this shared task and can view it in their dashboard once you approve the share.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={submitting || !formData.artist_id}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                {submitting ? "Sharing..." : "Share Task"}
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

export default TaskSharingModal;
