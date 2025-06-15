
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Clock, Eye, Edit, FileText, Target } from 'lucide-react';
import TaskBiddingModal from './TaskBiddingModal';
import { useTaskBids } from '@/hooks/useTaskBids';
import { Database } from '@/integrations/supabase/types';

type Task = Database["public"]["Tables"]["tasks"]["Row"];

interface TaskWithDetails extends Task {
  shots?: {
    name: string;
    frame_start: number;
    frame_end: number;
    sequences?: {
      name: string;
      projects?: {
        title: string;
        client_id: string;
      };
    };
  };
}

interface ArtistTaskBidViewProps {
  task: TaskWithDetails;
  userId: string;
  onBidSubmitted?: () => void;
}

const ArtistTaskBidView = ({ task, userId, onBidSubmitted }: ArtistTaskBidViewProps) => {
  const [showBiddingModal, setShowBiddingModal] = useState(false);
  const { getUserBid, refetch } = useTaskBids(task.id);
  const [userBid, setUserBid] = useState<any>(null);

  useEffect(() => {
    const bid = getUserBid(userId);
    setUserBid(bid);
  }, [getUserBid, userId]);

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

  const getBidStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'accepted':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'rejected':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'negotiating':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const handleBidSubmitted = () => {
    refetch();
    onBidSubmitted?.();
  };

  const canBid = !userBid || userBid.status === 'rejected';

  return (
    <Card className="bg-gray-900/50 border-gray-700 hover:border-blue-500/50 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-white text-lg flex items-center">
              <Target className="h-5 w-5 mr-2 text-blue-400" />
              {task.name}
            </CardTitle>
            <p className="text-gray-400 text-sm mt-1">
              {task.shots?.sequences?.projects?.title} / {task.shots?.sequences?.name} / {task.shots?.name}
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-blue-400 border-blue-500/30">
              {task.task_type}
            </Badge>
            <Badge variant="outline" className={getPriorityColor(task.priority)}>
              {task.priority}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {task.description && (
          <div>
            <p className="text-gray-300 text-sm line-clamp-3">
              {task.description}
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            {task.estimated_hours && (
              <p className="text-gray-300">
                <strong>Estimated Hours:</strong> {task.estimated_hours}h
              </p>
            )}
            <p className="text-gray-300">
              <strong>Status:</strong> {task.status}
            </p>
          </div>
          <div>
            <p className="text-gray-300">
              <strong>Shot Range:</strong> {task.shots?.frame_start} - {task.shots?.frame_end}
            </p>
            <p className="text-gray-300">
              <strong>Created:</strong> {new Date(task.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* User's Bid Status */}
        {userBid && (
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-blue-400 font-medium text-sm">Your Bid</h4>
              <Badge variant="outline" className={getBidStatusColor(userBid.status)}>
                {userBid.status}
              </Badge>
            </div>
            <div className="text-sm text-gray-300 space-y-1">
              <div className="flex justify-between">
                <span>Amount:</span>
                <span className="text-green-400">{userBid.amount} {userBid.currency}</span>
              </div>
              <div className="flex justify-between">
                <span>Timeline:</span>
                <span className="text-blue-400">{userBid.timeline_days} days</span>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Submitted: {new Date(userBid.created_at).toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
          
          {canBid && (
            <Button
              size="sm"
              className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              onClick={() => setShowBiddingModal(true)}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              {userBid ? 'Update Bid' : 'Place Bid'}
            </Button>
          )}

          {userBid && userBid.status === 'accepted' && (
            <Button
              size="sm"
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled
            >
              <Edit className="h-4 w-4 mr-2" />
              Assigned
            </Button>
          )}
        </div>
      </CardContent>

      {/* Bidding Modal */}
      <TaskBiddingModal
        isOpen={showBiddingModal}
        onClose={() => setShowBiddingModal(false)}
        task={task}
        onBidSubmitted={handleBidSubmitted}
      />
    </Card>
  );
};

export default ArtistTaskBidView;
