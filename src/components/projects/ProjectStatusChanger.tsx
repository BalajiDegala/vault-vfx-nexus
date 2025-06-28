
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useProjectStatuses } from "@/hooks/useProjectStatuses";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { ChevronDown, History } from "lucide-react";
import logger from "@/lib/logger";

type Project = Database["public"]["Tables"]["projects"]["Row"];
type AppRole = Database["public"]["Enums"]["app_role"];

interface ProjectStatusChangerProps {
  project: Project;
  userRole: AppRole | null;
  userId: string;
  onStatusChanged: () => void;
}

const ProjectStatusChanger: React.FC<ProjectStatusChangerProps> = ({
  project,
  userRole,
  userId,
  onStatusChanged,
}) => {
  const [open, setOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [reason, setReason] = useState("");
  const [changing, setChanging] = useState(false);
  const { 
    statuses, 
    validateTransition, 
    logStatusChange, 
    getStatusColor, 
    getAvailableTransitions 
  } = useProjectStatuses();
  const { toast } = useToast();

  const userRoles = userRole ? [userRole] : [];
  const availableTransitions = getAvailableTransitions(project.status || "draft", userRoles);

  const handleStatusChange = async () => {
    if (!selectedStatus || !project.id) return;

    setChanging(true);
    try {
      // Validate transition
      const isValid = await validateTransition(
        project.id,
        project.status || "draft",
        selectedStatus,
        userId
      );

      if (!isValid) {
        toast({
          title: "Invalid Transition",
          description: "You don't have permission to change to this status.",
          variant: "destructive",
        });
        return;
      }

      // Update project status
      const { error } = await supabase
        .from("projects")
        .update({ status: selectedStatus as any })
        .eq("id", project.id);

      if (error) throw error;

      // Log status change
      await logStatusChange(
        project.id,
        project.status,
        selectedStatus,
        userId,
        reason
      );

      toast({
        title: "Status Updated",
        description: `Project status changed to "${selectedStatus}".`,
      });

      setOpen(false);
      setSelectedStatus("");
      setReason("");
      onStatusChanged();
    } catch (error: any) {
      logger.error("Error changing status:", error);
      toast({
        title: "Error",
        description: "Failed to change project status.",
        variant: "destructive",
      });
    } finally {
      setChanging(false);
    }
  };

  const currentStatusColor = getStatusColor(project.status || "draft");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          style={{
            borderColor: currentStatusColor,
            color: currentStatusColor,
          }}
        >
          <Badge
            style={{
              backgroundColor: `${currentStatusColor}20`,
              color: currentStatusColor,
              border: `1px solid ${currentStatusColor}`,
            }}
          >
            {project.status?.replace('_', ' ').toUpperCase()}
          </Badge>
          <ChevronDown className="w-3 h-3" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Project Status</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="status">New Status</Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                {availableTransitions.map((transition) => {
                  const targetStatus = statuses.find(s => s.name === transition.to_status);
                  return (
                    <SelectItem key={transition.to_status} value={transition.to_status}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: targetStatus?.color || "#6b7280" }}
                        />
                        {transition.to_status.replace('_', ' ').toUpperCase()}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {availableTransitions.length === 0 && (
              <p className="text-sm text-gray-500 mt-1">
                No status changes available for your role.
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="reason">Reason (Optional)</Label>
            <Textarea
              id="reason"
              placeholder="Explain why you're changing the status..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={changing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStatusChange}
              disabled={!selectedStatus || changing}
            >
              {changing ? "Updating..." : "Update Status"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectStatusChanger;
