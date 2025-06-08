
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type Project = Database["public"]["Tables"]["projects"]["Row"];

interface BidModalProps {
  open: boolean;
  onClose: () => void;
  project: Project;
  onSuccess: () => void;
}

const BidModal = ({ open, onClose, project, onSuccess }: BidModalProps) => {
  const [formData, setFormData] = useState({
    amount: "",
    timeline_days: "",
    proposal: "",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please log in to place a bid",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("project_bids")
        .insert({
          project_id: project.id,
          bidder_id: session.user.id,
          amount: parseFloat(formData.amount),
          timeline_days: formData.timeline_days ? parseInt(formData.timeline_days) : null,
          proposal: formData.proposal,
          currency: "V3C",
        });

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Bid Already Exists",
            description: "You have already placed a bid on this project",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to place bid",
            variant: "destructive",
          });
        }
        return;
      }

      toast({
        title: "Bid Placed Successfully",
        description: "Your bid has been submitted to the client",
      });

      onSuccess();
      setFormData({
        amount: "",
        timeline_days: "",
        proposal: "",
      });
    } catch (error) {
      console.error("Error placing bid:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-gray-900 border-blue-500/20">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            Place Bid on "{project.title}"
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <p className="text-gray-300 text-sm mb-2">Project Budget Range:</p>
            <p className="text-green-400 font-semibold">
              {project.budget_min?.toLocaleString()} - {project.budget_max?.toLocaleString()} {project.currency}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-gray-300">Your Bid Amount (V3C) *</Label>
            <Input
              id="amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              required
              min={project.budget_min || 0}
              max={project.budget_max || undefined}
              className="bg-gray-800/50 border-gray-600 text-white"
              placeholder="Enter your bid amount"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeline_days" className="text-gray-300">Timeline (Days)</Label>
            <Input
              id="timeline_days"
              type="number"
              value={formData.timeline_days}
              onChange={(e) => setFormData(prev => ({ ...prev, timeline_days: e.target.value }))}
              className="bg-gray-800/50 border-gray-600 text-white"
              placeholder="Estimated completion time"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="proposal" className="text-gray-300">Proposal *</Label>
            <Textarea
              id="proposal"
              value={formData.proposal}
              onChange={(e) => setFormData(prev => ({ ...prev, proposal: e.target.value }))}
              required
              className="bg-gray-800/50 border-gray-600 text-white min-h-[120px]"
              placeholder="Describe your approach, experience, and why you're the best fit for this project..."
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-gray-600 text-gray-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              {loading ? "Placing Bid..." : "Place Bid"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BidModal;
