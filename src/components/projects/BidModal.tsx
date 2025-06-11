
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, Clock, FileText } from "lucide-react";

interface BidModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onSuccess: () => void;
}

const BidModal = ({ isOpen, onClose, projectId, onSuccess }: BidModalProps) => {
  const [formData, setFormData] = useState({
    amount: "",
    currency: "V3C",
    timeline_days: "",
    proposal: ""
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.timeline_days || !formData.proposal) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { error } = await supabase
        .from("project_bids")
        .insert({
          project_id: projectId,
          bidder_id: user.id,
          amount: parseFloat(formData.amount),
          currency: formData.currency,
          timeline_days: parseInt(formData.timeline_days),
          proposal: formData.proposal
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your bid has been submitted successfully!"
      });

      setFormData({
        amount: "",
        currency: "V3C",
        timeline_days: "",
        proposal: ""
      });

      onSuccess();
    } catch (error: any) {
      console.error("Error submitting bid:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit bid",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-blue-500/20 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Submit Your Bid
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
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
              <FileText className="h-4 w-4 mr-2 text-purple-400" />
              Proposal *
            </Label>
            <Textarea
              value={formData.proposal}
              onChange={(e) => setFormData({...formData, proposal: e.target.value})}
              className="bg-gray-800/50 border-gray-600 text-white min-h-32"
              placeholder="Describe your approach, experience, and why you're the best fit for this project..."
              required
            />
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h4 className="text-blue-400 font-medium mb-2">Bid Summary</h4>
            <div className="text-sm text-gray-300 space-y-1">
              <p>Amount: {formData.amount ? `${formData.amount} ${formData.currency}` : "Not specified"}</p>
              <p>Timeline: {formData.timeline_days ? `${formData.timeline_days} days` : "Not specified"}</p>
              <p className="text-gray-400 text-xs mt-2">
                Your bid will be visible to the project owner. Make sure to provide competitive pricing and realistic timelines.
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
            >
              {loading ? "Submitting..." : "Submit Bid"}
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
      </DialogContent>
    </Dialog>
  );
};

export default BidModal;
