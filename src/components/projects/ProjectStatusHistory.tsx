
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, ArrowRight, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useProjectStatuses } from "@/hooks/useProjectStatuses";
import { useProjectUsers } from "@/hooks/useProjectUsers";
import logger from "@/lib/logger";

interface StatusHistoryEntry {
  id: string;
  from_status: string | null;
  to_status: string;
  changed_by: string | null;
  reason: string | null;
  created_at: string;
}

interface ProjectStatusHistoryProps {
  projectId: string;
}

const ProjectStatusHistory: React.FC<ProjectStatusHistoryProps> = ({
  projectId,
}) => {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<StatusHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const { getStatusColor } = useProjectStatuses();
  const { users, getUserDisplayName } = useProjectUsers();

  useEffect(() => {
    if (open) {
      fetchHistory();
    }
  }, [open, projectId]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("project_status_history")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      logger.error("Error fetching status history:", error);
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (userId: string | null) => {
    if (!userId) return "System";
    const user = users.find(u => u.id === userId);
    return user ? getUserDisplayName(user) : "Unknown User";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <History className="w-4 h-4" />
          History
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Project Status History</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-96">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Loading history...</div>
            </div>
          ) : history.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">No status changes recorded</div>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((entry, index) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-4 p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-2 flex-1">
                    {entry.from_status && (
                      <>
                        <Badge
                          style={{
                            backgroundColor: `${getStatusColor(entry.from_status)}20`,
                            color: getStatusColor(entry.from_status),
                            border: `1px solid ${getStatusColor(entry.from_status)}`,
                          }}
                        >
                          {entry.from_status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </>
                    )}
                    <Badge
                      style={{
                        backgroundColor: `${getStatusColor(entry.to_status)}20`,
                        color: getStatusColor(entry.to_status),
                        border: `1px solid ${getStatusColor(entry.to_status)}`,
                      }}
                    >
                      {entry.to_status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="text-right text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {getUserName(entry.changed_by)}
                    </div>
                    <div>{formatDate(entry.created_at)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectStatusHistory;
