import { useState, useEffect } from 'react';
// CHANGED: Use default import for useProjectTasks to fix import error
import useProjectTasks from "@/hooks/useProjectTasks";
import { useSharedTasks } from '@/hooks/useSharedTasks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Share2, UserCheck, UserX, Clock, Eye, Edit, MessageSquare } from 'lucide-react';
import { useArtistLookup } from "@/hooks/useArtistLookup";
import { useProjectTasks } from "@/hooks/useProjectTasks";

interface StudioTaskSharingProps {
  userId: string;
}

const StudioTaskSharing = ({ userId }: StudioTaskSharingProps) => {
  const { sharedTasks, shareTaskWithArtist, approveTaskAccess, loading: sharingLoading } = useSharedTasks('studio', userId);

  // Project & Task selection state
  const { projects, tasksByProject, loading: loadingProjects } = useProjectTasks(userId);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedTask, setSelectedTask] = useState<string>("");
  const [artistEmail, setArtistEmail] = useState("");
  const [accessLevel, setAccessLevel] = useState<'view' | 'edit' | 'comment'>('view');
  const [notes, setNotes] = useState("");
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const { artistId, error: artistError, loading: artistLookupLoading, lookupArtistId } = useArtistLookup();
  const [shareError, setShareError] = useState<string | null>(null);

  // Reset task selection if project changes
  useEffect(() => {
    setSelectedTask('');
  }, [selectedProject]);

  const handleShareTask = async () => {
    setShareError(null);
    if (!selectedProject || !selectedTask || !artistEmail) {
      setShareError("Choose a project, task and artist email.");
      return;
    }
    // Lookup artistId
    const aid = await lookupArtistId(artistEmail.trim());
    if (!aid) {
      setShareError("Artist with this email does not exist or is not an artist.");
      return;
    }
    // Share!
    await shareTaskWithArtist(selectedTask, aid, accessLevel, notes);
    setSelectedTask('');
    setSelectedProject('');
    setArtistEmail('');
    setAccessLevel('view');
    setNotes('');
    setShareDialogOpen(false);
    setShareError(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-600/20 text-yellow-400 border-yellow-500/30';
      case 'approved':
        return 'bg-green-600/20 text-green-400 border-green-500/30';
      case 'rejected':
        return 'bg-red-600/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-600/20 text-gray-400 border-gray-500/30';
    }
  };

  const getAccessIcon = (accessLevel: string) => {
    switch (accessLevel) {
      case 'view':
        return <Eye className="h-4 w-4" />;
      case 'edit':
        return <Edit className="h-4 w-4" />;
      case 'comment':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Task Sharing Management</h2>
        
        <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Share2 className="h-4 w-4 mr-2" />
              Share Task
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Share Task with Artist</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Project Selector */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Select Project</label>
                <Select value={selectedProject} onValueChange={setSelectedProject} disabled={loadingProjects}>
                  <SelectTrigger className="bg-gray-800 border-gray-600">
                    <SelectValue placeholder="Choose a project" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id} className="text-white">{p.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Task Selector */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Select Task</label>
                <Select value={selectedTask} onValueChange={setSelectedTask} disabled={!selectedProject || loadingProjects}>
                  <SelectTrigger className="bg-gray-800 border-gray-600">
                    <SelectValue placeholder={selectedProject ? "Choose a task to share" : "Select project first"} />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    {(selectedProject && tasksByProject[selectedProject]?.length > 0) ? (
                      tasksByProject[selectedProject].map((task) => (
                        <SelectItem key={task.id} value={task.id} className="text-white">
                          {task.name} ({task.task_type})
                        </SelectItem>
                      ))
                    ) : (
                      <div className="text-gray-400 px-2 py-1">No tasks found.</div>
                    )}
                  </SelectContent>
                </Select>
              </div>
              {/* Artist Email */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Artist Email</label>
                <Input
                  value={artistEmail}
                  onChange={(e) => setArtistEmail(e.target.value)}
                  placeholder="artist@example.com"
                  className="bg-gray-800 border-gray-600 text-white"
                />
                {artistLookupLoading && <div className="text-blue-400 text-xs mt-1">Looking up artist...</div>}
                {artistError && <div className="text-red-400 text-xs mt-1">{artistError}</div>}
              </div>
              {/* Access Level, Notes ... */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Access Level</label>
                <Select value={accessLevel} onValueChange={(value: any) => setAccessLevel(value)}>
                  <SelectTrigger className="bg-gray-800 border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="view" className="text-white">View Only</SelectItem>
                    <SelectItem value="comment" className="text-white">View & Comment</SelectItem>
                    <SelectItem value="edit" className="text-white">View & Edit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Notes for Artist</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any specific instructions or context for the artist..."
                  className="bg-gray-800 border-gray-600 text-white"
                  rows={3}
                />
              </div>
              {/* Error */}
              {shareError && <div className="text-red-500 text-sm">{shareError}</div>}
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleShareTask} 
                  className="bg-blue-600 hover:bg-blue-700 flex-1"
                  disabled={artistLookupLoading}
                >
                  {sharingLoading ? "Sharing..." : "Share Task"}
                </Button>
                <Button variant="outline" onClick={() => setShareDialogOpen(false)} className="border-gray-600">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Shared Tasks List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Shared Tasks</h3>
        
        {sharingLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          </div>
        ) : sharedTasks.length === 0 ? (
          <Card className="bg-gray-900/50 border-gray-700">
            <CardContent className="text-center py-8">
              <Share2 className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No tasks have been shared yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {sharedTasks.map((sharedTask) => {
              const task = sharedTask.tasks;
              if (!task) return null;

              return (
                <Card key={sharedTask.id} className="bg-gray-900/50 border-gray-700">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-white text-lg">{task.name}</CardTitle>
                        <p className="text-gray-400 text-sm mt-1">
                          Shared with: {sharedTask.profiles?.first_name} {sharedTask.profiles?.last_name}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline" className={getStatusColor(sharedTask.status)}>
                          {sharedTask.status}
                        </Badge>
                        <Badge variant="outline" className="text-blue-400 border-blue-500/30">
                          {getAccessIcon(sharedTask.access_level)}
                          {sharedTask.access_level}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-300">
                          <strong>Task Type:</strong> {task.task_type}
                        </p>
                        <p className="text-gray-300">
                          <strong>Priority:</strong> {task.priority}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-300">
                          <strong>Shared:</strong> {new Date(sharedTask.shared_at).toLocaleDateString()}
                        </p>
                        {sharedTask.approved_at && (
                          <p className="text-gray-300">
                            <strong>Approved:</strong> {new Date(sharedTask.approved_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>

                    {sharedTask.notes && (
                      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                        <p className="text-blue-300 text-sm">{sharedTask.notes}</p>
                      </div>
                    )}

                    {sharedTask.status === 'pending' && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => approveTaskAccess(sharedTask.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          Approve Access
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-600 text-red-400 hover:bg-red-900/20"
                        >
                          <UserX className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudioTaskSharing;
