
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChevronDown, ChevronRight, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import ShotsList from "./ShotsList";
import { Database } from "@/integrations/supabase/types";

type Project = Database["public"]["Tables"]["projects"]["Row"];
type Sequence = Database["public"]["Tables"]["sequences"]["Row"];

interface ProjectHierarchyProps {
  project: Project;
  userRole?: string;
  renderShotsList?: (sequenceId: string) => React.ReactNode;
}

export default function ProjectHierarchy({ project, userRole, renderShotsList }: ProjectHierarchyProps) {
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [openSequence, setOpenSequence] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    supabase
      .from("sequences")
      .select("*")
      .eq("project_id", project.id)
      .order("order_index", { ascending: true })
      .then(({ data }) => {
        setSequences(data || []);
        setLoading(false);
      });
  }, [project.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="animate-spin mr-2" />
        <span className="text-gray-400">Loading project structure...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Project Structure</h3>
        {(userRole === 'studio' || userRole === 'admin' || userRole === 'producer') && (
          <Button
            variant="outline"
            size="sm"
            className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Sequence
          </Button>
        )}
      </div>

      {sequences.length === 0 ? (
        <div className="text-center py-12 bg-gray-900/30 rounded-lg border border-gray-700">
          <h3 className="text-lg font-medium text-gray-300 mb-2">No Sequences</h3>
          <p className="text-gray-500 mb-4">Add sequences to organize your project shots.</p>
          {(userRole === 'studio' || userRole === 'admin' || userRole === 'producer') && (
            <Button
              variant="outline"
              className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Sequence
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {sequences.map(sequence => (
            <div key={sequence.id} className="border border-gray-700 rounded-lg bg-gray-900/30">
              <button
                className="w-full flex items-center gap-2 p-4 font-medium text-purple-200 hover:bg-gray-800/50 transition-colors"
                onClick={() => setOpenSequence(s => s === sequence.id ? null : sequence.id)}
              >
                {openSequence === sequence.id
                  ? <ChevronDown className="w-4 h-4" />
                  : <ChevronRight className="w-4 h-4" />}
                <span className="flex-1 text-left">{sequence.name}</span>
                <span className="ml-2 text-xs bg-gray-700 rounded px-2 py-0.5">{sequence.status}</span>
              </button>
              
              {openSequence === sequence.id && (
                <div className="border-t border-gray-700 p-4">
                  {renderShotsList ? 
                    renderShotsList(sequence.id) : 
                    <ShotsList sequenceId={sequence.id} userRole={userRole} />
                  }
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
