
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Share2, Eye, DollarSign, CheckCircle, XCircle, Clock, MessageSquare } from 'lucide-react';
import { useProjectShares } from '@/hooks/useProjectShares';
import ProjectShareModal from './ProjectShareModal';
import { Database } from '@/integrations/supabase/types';

type Project = Database["public"]["Tables"]["projects"]["Row"];

interface ProjectSharesManagementProps {
  project: Project;
  userRole: string;
  userId: string;
}

const ProjectSharesManagement = ({ project, userRole, userId }: ProjectSharesManagementProps) => {
  const { shares, updateShareStatus } = useProjectShares(userId);
  const [showShareModal, setShowShareModal] = useState(false);
  const [responseNotes, setResponseNotes] = useState<{[key: string]: string}>({});

  const projectShares = shares.filter(share => share.project_id === project.id);
  const canShareProject = userRole === 'producer' || userRole === 'admin';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'accepted':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'rejected':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getAccessLevelColor = (accessLevel: string) => {
    switch (accessLevel) {
      case 'view':
        return 'bg-blue-500/20 text-blue-400';
      case 'bid':
        return 'bg-purple-500/20 text-purple-400';
      case 'full':
        return 'bg-green-500/20 text-green-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const handleStatusUpdate = async (shareId: string, status: string) => {
    const notes = responseNotes[shareId];
    await updateShareStatus(shareId, status, notes);
    setResponseNotes(prev => ({ ...prev, [shareId]: '' }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">Project Shares</h3>
          <p className="text-gray-400">Manage project sharing with studios</p>
        </div>
        
        {canShareProject && (
          <Button
            onClick={() => setShowShareModal(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share Project
          </Button>
        )}
      </div>

      {/* Project Shares List */}
      <div className="space-y-4">
        {projectShares.length === 0 ? (
          <Card className="bg-gray-900/50 border-gray-700">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Share2 className="h-12 w-12 text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">No Project Shares</h3>
              <p className="text-gray-500 mb-4">
                {canShareProject 
                  ? "Share this project with studios to get bids and collaborations." 
                  : "No studios have been shared this project yet."
                }
              </p>
              {canShareProject && (
                <Button
                  onClick={() => setShowShareModal(true)}
                  variant="outline"
                  className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Project
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          projectShares.map((share) => (
            <Card key={share.id} className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-white text-lg">
                      {share.studio_profile?.first_name} {share.studio_profile?.last_name}
                    </CardTitle>
                    <p className="text-gray-400 text-sm">
                      @{share.studio_profile?.username} • {share.studio_profile?.email}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className={getStatusColor(share.status)}>
                      {share.status}
                    </Badge>
                    <Badge variant="outline" className={getAccessLevelColor(share.access_level)}>
                      {share.access_level} access
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="text-sm text-gray-300">
                  <p><strong>Shared:</strong> {new Date(share.shared_at).toLocaleString()}</p>
                  {share.responded_at && (
                    <p><strong>Responded:</strong> {new Date(share.responded_at).toLocaleString()}</p>
                  )}
                </div>

                {share.notes && (
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                    <h4 className="text-blue-400 font-medium text-sm mb-2">Notes</h4>
                    <p className="text-gray-300 text-sm">{share.notes}</p>
                  </div>
                )}

                {/* Response Actions for Studios */}
                {userRole === 'studio' && share.studio_id === userId && share.status === 'pending' && (
                  <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4 space-y-3">
                    <h4 className="text-white font-medium">Respond to Project Share</h4>
                    
                    <Textarea
                      value={responseNotes[share.id] || ''}
                      onChange={(e) => setResponseNotes(prev => ({ ...prev, [share.id]: e.target.value }))}
                      className="bg-gray-700/50 border-gray-600 text-white"
                      placeholder="Add your response notes (optional)..."
                    />
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleStatusUpdate(share.id, 'accepted')}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        size="sm"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Accept
                      </Button>
                      <Button
                        onClick={() => handleStatusUpdate(share.id, 'rejected')}
                        variant="outline"
                        className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                        size="sm"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Decline
                      </Button>
                    </div>
                  </div>
                )}

                {/* Action Buttons for Different Access Levels */}
                {share.status === 'accepted' && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Project
                    </Button>
                    
                    {(share.access_level === 'bid' || share.access_level === 'full') && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                      >
                        <DollarSign className="h-4 w-4 mr-2" />
                        Submit Bid
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Share Modal */}
      <ProjectShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        project={project}
        onShareSubmitted={() => {
          setShowShareModal(false);
        }}
      />
    </div>
  );
};

export default ProjectSharesManagement;
