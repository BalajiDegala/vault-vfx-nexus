import { useSharedTasks } from '@/hooks/useSharedTasks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, PlayCircle, CheckCircle, FileText, Eye, AlertCircle } from 'lucide-react';

interface ArtistTasksViewProps {
  userId: string;
}

const ArtistTasksView = ({ userId }: ArtistTasksViewProps) => {
  const { sharedTasks, loading } = useSharedTasks('artist', userId);

  console.log('🎨 === ArtistTasksView Debug ===');
  console.log('👤 userId:', userId);
  console.log('⏳ loading:', loading);
  console.log('📊 sharedTasks count:', sharedTasks.length);
  console.log('📋 sharedTasks data:', sharedTasks);

  const getTaskTypeIcon = (taskType: string) => {
    switch (taskType) {
      case 'modeling':
        return '🎭';
      case 'animation':
        return '🎬';
      case 'lighting':
        return '💡';
      case 'compositing':
        return '🎨';
      case 'fx':
        return '✨';
      default:
        return '📋';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo':
        return 'bg-gray-600';
      case 'in_progress':
        return 'bg-blue-600';
      case 'review':
        return 'bg-orange-600';
      case 'completed':
        return 'bg-green-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-green-600/20 text-green-400 border-green-500/30';
      case 'medium':
        return 'bg-yellow-600/20 text-yellow-400 border-yellow-500/30';
      case 'high':
        return 'bg-orange-600/20 text-orange-400 border-orange-500/30';
      case 'critical':
        return 'bg-red-600/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-600/20 text-gray-400 border-gray-500/30';
    }
  };

  const getShareStatusColor = (status: string) => {
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

  if (loading) {
    console.log('⏳ ArtistTasksView: Still loading...');
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
        <span className="ml-2 text-gray-400">Loading your assigned tasks...</span>
      </div>
    );
  }

  if (sharedTasks.length === 0) {
    console.log('❌ ArtistTasksView: No tasks found, showing empty state');
    return (
      <div className="text-center py-20">
        <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No Tasks Assigned</h3>
        <p className="text-gray-400 mb-6">You don't have any tasks shared with you yet.</p>
        <p className="text-sm text-gray-500">Studios will share specific tasks with you once they're ready for your contribution.</p>
        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg max-w-md mx-auto">
          <p className="text-blue-300 text-sm">
            <strong>Debug Info:</strong> User ID: {userId}
          </p>
        </div>
      </div>
    );
  }

  console.log('✅ ArtistTasksView: Rendering tasks...');

  // Separate tasks by share status
  const pendingTasks = sharedTasks.filter(t => t.status === 'pending');
  const approvedTasks = sharedTasks.filter(t => t.status === 'approved');
  const rejectedTasks = sharedTasks.filter(t => t.status === 'rejected');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Your Assigned Tasks</h2>
        <div className="flex gap-2">
          {pendingTasks.length > 0 && (
            <Badge variant="outline" className="text-yellow-400 border-yellow-500/30">
              {pendingTasks.length} Pending
            </Badge>
          )}
          {approvedTasks.length > 0 && (
            <Badge variant="outline" className="text-green-400 border-green-500/30">
              {approvedTasks.length} Approved
            </Badge>
          )}
          {rejectedTasks.length > 0 && (
            <Badge variant="outline" className="text-red-400 border-red-500/30">
              {rejectedTasks.length} Rejected
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-6">
        {sharedTasks.map((sharedTask) => {
          const task = sharedTask.tasks;
          console.log('Rendering shared task:', sharedTask.id, 'task data:', task);
          
          if (!task) {
            console.log('No task data for shared task:', sharedTask.id);
            return (
              <Card key={sharedTask.id} className="bg-gray-900/50 border-gray-700">
                <CardContent className="p-6">
                  <p className="text-red-400">Task data not found for shared task ID: {sharedTask.id}</p>
                  <p className="text-gray-400 text-sm mt-2">Task ID: {sharedTask.task_id}</p>
                </CardContent>
              </Card>
            );
          }

          return (
            <Card key={sharedTask.id} className="bg-gray-900/50 border-gray-700 hover:border-blue-500/30 transition-colors">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getTaskTypeIcon(task.task_type)}</span>
                    <div>
                      <CardTitle className="text-white text-xl">{task.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className={getShareStatusColor(sharedTask.status)}>
                          {sharedTask.status === 'pending' && <AlertCircle className="h-3 w-3 mr-1" />}
                          {sharedTask.status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                          Share {sharedTask.status}
                        </Badge>
                        <Badge variant="outline" className={`${getStatusColor(task.status)} text-white`}>
                          {task.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline" className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        <Badge variant="outline" className="text-purple-400 border-purple-500/30">
                          {task.task_type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-400 border-green-500/30">
                    <Eye className="h-3 w-3 mr-1" />
                    {sharedTask.access_level}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {sharedTask.status === 'pending' && (
                  <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-yellow-400 mb-2">Pending Approval</h4>
                    <p className="text-yellow-300 text-sm">This task share is waiting for approval. You can view details but may have limited access until approved.</p>
                  </div>
                )}

                {task.description && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Description</h4>
                    <p className="text-gray-300 text-sm leading-relaxed">{task.description}</p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-400">Project Details</h4>
                    <div className="space-y-2">
                      {task.shots?.sequences?.projects && (
                        <>
                          <p className="text-white text-sm">
                            <strong>Project:</strong> {task.shots.sequences.projects.title}
                          </p>
                          {task.shots.sequences.projects.project_code && (
                            <p className="text-gray-300 text-sm">
                              <strong>Code:</strong> {task.shots.sequences.projects.project_code}
                            </p>
                          )}
                        </>
                      )}
                      {task.shots?.sequences && (
                        <p className="text-gray-300 text-sm">
                          <strong>Sequence:</strong> {task.shots.sequences.name}
                        </p>
                      )}
                      {task.shots && (
                        <p className="text-gray-300 text-sm">
                          <strong>Shot:</strong> {task.shots.name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-400">Task Info</h4>
                    <div className="space-y-2">
                      {task.estimated_hours && (
                        <p className="text-gray-300 text-sm flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {task.estimated_hours} hours estimated
                        </p>
                      )}
                      {sharedTask.profiles && (
                        <p className="text-gray-300 text-sm">
                          <strong>Shared by:</strong> {sharedTask.profiles.first_name} {sharedTask.profiles.last_name}
                        </p>
                      )}
                      <p className="text-gray-300 text-sm">
                        <strong>Shared:</strong> {new Date(sharedTask.shared_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {sharedTask.notes && (
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-400 mb-2">Studio Notes</h4>
                    <p className="text-blue-300 text-sm">{sharedTask.notes}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  {sharedTask.status === 'approved' && (
                    <>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Start Work
                      </Button>
                      <Button size="sm" variant="outline" className="border-gray-600 text-gray-300">
                        <FileText className="h-4 w-4 mr-2" />
                        View Files
                      </Button>
                      {task.status === 'in_progress' && (
                        <Button size="sm" variant="outline" className="border-green-600 text-green-400">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Submit for Review
                        </Button>
                      )}
                    </>
                  )}
                  {sharedTask.status === 'pending' && (
                    <Button size="sm" variant="outline" className="border-yellow-600 text-yellow-400" disabled>
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Waiting for Approval
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ArtistTasksView;
