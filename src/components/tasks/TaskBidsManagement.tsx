
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DollarSign, Clock, User, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { useTaskBids } from '@/hooks/useTaskBids';
import { useTaskAssignments } from '@/hooks/useTaskAssignments';
import { Database } from '@/integrations/supabase/types';
import logger from "@/lib/logger";

type Task = Database["public"]["Tables"]["tasks"]["Row"];

interface TaskBidsManagementProps {
  task: Task;
  userRole: string;
  userId: string;
}

const TaskBidsManagement = ({ task, userRole, userId }: TaskBidsManagementProps) => {
  const { bids, loading, updateBidStatus } = useTaskBids(task.id);
  const { createAssignment } = useTaskAssignments(userId);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [selectedBid, setSelectedBid] = useState<any>(null);
  const [assignmentNotes, setAssignmentNotes] = useState('');

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

  const handleAcceptBid = (bid: any) => {
    setSelectedBid(bid);
    setAssignmentDialogOpen(true);
  };

  const handleCreateAssignment = async () => {
    if (!selectedBid) return;

    try {
      await createAssignment({
        task_id: task.id,
        artist_id: selectedBid.bidder_id,
        bid_id: selectedBid.id,
        agreed_amount: selectedBid.amount,
        agreed_currency: selectedBid.currency,
        agreed_timeline_days: selectedBid.timeline_days,
        notes: assignmentNotes,
        due_date: new Date(Date.now() + selectedBid.timeline_days * 24 * 60 * 60 * 1000).toISOString(),
      });

      // Update bid status to accepted
      await updateBidStatus(selectedBid.id, 'accepted');

      setAssignmentDialogOpen(false);
      setSelectedBid(null);
      setAssignmentNotes('');
    } catch (error) {
      logger.error('Error creating assignment:', error);
    }
  };

  const canManageBids = userRole === 'studio' || userRole === 'admin';

  if (loading) {
    return (
      <Card className="bg-gray-900/50 border-gray-700">
        <CardContent className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
          <p className="text-gray-400 mt-2">Loading bids...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Task Bids ({bids.length})</h3>
      </div>

      {bids.length === 0 ? (
        <Card className="bg-gray-900/50 border-gray-700">
          <CardContent className="text-center py-8">
            <DollarSign className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No bids submitted yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bids.map((bid) => (
            <Card key={bid.id} className="bg-gray-900/50 border-gray-700">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-white text-lg flex items-center">
                      <User className="h-5 w-5 mr-2 text-blue-400" />
                      {bid.profiles?.first_name} {bid.profiles?.last_name}
                    </CardTitle>
                    <p className="text-gray-400 text-sm mt-1">
                      {bid.profiles?.email}
                    </p>
                  </div>
                  <Badge variant="outline" className={getBidStatusColor(bid.status)}>
                    {bid.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-green-400" />
                    <span className="text-green-400 font-semibold">
                      {bid.amount} {bid.currency}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-blue-400" />
                    <span className="text-blue-400">
                      {bid.timeline_days} days
                    </span>
                  </div>
                </div>

                {bid.proposal && (
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                    <p className="text-blue-300 text-sm">{bid.proposal}</p>
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  Submitted: {new Date(bid.created_at).toLocaleString()}
                </div>

                {canManageBids && bid.status === 'pending' && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => handleAcceptBid(bid)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Accept & Assign
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateBidStatus(bid.id, 'rejected')}
                      className="border-red-600 text-red-400 hover:bg-red-900/20"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateBidStatus(bid.id, 'negotiating')}
                      className="border-blue-600 text-blue-400 hover:bg-blue-900/20"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Negotiate
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Assignment Dialog */}
      <Dialog open={assignmentDialogOpen} onOpenChange={setAssignmentDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Create Task Assignment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedBid && (
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                <h4 className="text-green-400 font-medium mb-2">Selected Bid Details</h4>
                <div className="text-sm text-gray-300 space-y-1">
                  <p>Artist: {selectedBid.profiles?.first_name} {selectedBid.profiles?.last_name}</p>
                  <p>Amount: {selectedBid.amount} {selectedBid.currency}</p>
                  <p>Timeline: {selectedBid.timeline_days} days</p>
                </div>
              </div>
            )}
            
            <div>
              <Label className="text-gray-300 mb-2 block">Assignment Notes (Optional)</Label>
              <Textarea
                value={assignmentNotes}
                onChange={(e) => setAssignmentNotes(e.target.value)}
                placeholder="Any specific instructions or requirements for the artist..."
                className="bg-gray-800 border-gray-600 text-white"
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleCreateAssignment}
                className="bg-green-600 hover:bg-green-700 flex-1"
              >
                Create Assignment
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setAssignmentDialogOpen(false)}
                className="border-gray-600"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskBidsManagement;
