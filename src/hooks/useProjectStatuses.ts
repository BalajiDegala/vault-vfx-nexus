
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type ProjectStatus = {
  id: string;
  name: string;
  description: string | null;
  color: string;
  is_system_status: boolean;
  is_active: boolean;
  sort_order: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type StatusTransition = {
  id: string;
  from_status: string;
  to_status: string;
  allowed_roles: string[];
  requires_approval: boolean;
  auto_notification: boolean;
  created_at: string;
};

export const useProjectStatuses = () => {
  const [statuses, setStatuses] = useState<ProjectStatus[]>([]);
  const [transitions, setTransitions] = useState<StatusTransition[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchStatuses();
    fetchTransitions();
  }, []);

  const fetchStatuses = async () => {
    try {
      const { data, error } = await supabase
        .from("project_statuses")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");

      if (error) throw error;
      setStatuses(data || []);
    } catch (error) {
      console.error("Error fetching project statuses:", error);
      toast({
        title: "Error",
        description: "Failed to fetch project statuses",
        variant: "destructive",
      });
    }
  };

  const fetchTransitions = async () => {
    try {
      const { data, error } = await supabase
        .from("project_status_transitions")
        .select("*");

      if (error) throw error;
      setTransitions(data || []);
    } catch (error) {
      console.error("Error fetching status transitions:", error);
    } finally {
      setLoading(false);
    }
  };

  const validateTransition = async (
    projectId: string,
    fromStatus: string,
    toStatus: string,
    userId: string
  ): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc("validate_project_status_transition", {
        p_project_id: projectId,
        p_from_status: fromStatus,
        p_to_status: toStatus,
        p_user_id: userId,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error validating status transition:", error);
      return false;
    }
  };

  const logStatusChange = async (
    projectId: string,
    fromStatus: string | null,
    toStatus: string,
    changedBy: string,
    reason?: string
  ) => {
    try {
      const { error } = await supabase
        .from("project_status_history")
        .insert({
          project_id: projectId,
          from_status: fromStatus,
          to_status: toStatus,
          changed_by: changedBy,
          reason: reason || null,
        });

      if (error) throw error;
    } catch (error) {
      console.error("Error logging status change:", error);
    }
  };

  const getStatusColor = (statusName: string): string => {
    const status = statuses.find(s => s.name === statusName);
    return status?.color || "#6b7280";
  };

  const getAvailableTransitions = (currentStatus: string, userRoles: string[]) => {
    return transitions.filter(
      (transition) =>
        transition.from_status === currentStatus &&
        transition.allowed_roles.some((role) => userRoles.includes(role))
    );
  };

  return {
    statuses,
    transitions,
    loading,
    validateTransition,
    logStatusChange,
    getStatusColor,
    getAvailableTransitions,
    refreshStatuses: fetchStatuses,
  };
};
