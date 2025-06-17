
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChevronDown, ChevronRight, Loader2, SortAsc, SortDesc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Database } from "@/integrations/supabase/types";
import ShotTasksViewEnhanced from "./ShotTasksViewEnhanced";

type Shot = Database["public"]["Tables"]["shots"]["Row"];

const statusOptions = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "review", label: "Review" },
  { value: "approved", label: "Approved" },
];

type SortCol = "name" | "status" | "frame_start";

interface ShotsListEnhancedProps {
  sequenceId: string;
  userRole?: string;
  userId: string;
  onShareTask?: (taskId: string) => void;
}

export default function ShotsListEnhanced({ 
  sequenceId, 
  userRole, 
  userId,
  onShareTask 
}: ShotsListEnhancedProps) {
  const [shots, setShots] = useState<Shot[]>([]);
  const [openShot, setOpenShot] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortCol, setSortCol] = useState<SortCol>("frame_start");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    setLoading(true);
    fetchShots();
  }, [sequenceId, userRole, userId]);

  const fetchShots = async () => {
    try {
      console.log('🔍 Fetching shots for sequence:', sequenceId, 'userRole:', userRole);
      
      // The RLS policies will automatically filter shots based on user access
      const { data, error } = await supabase
        .from("shots")
        .select("*")
        .eq("sequence_id", sequenceId);

      if (error) {
        console.error('Error fetching shots:', error);
        setShots([]);
      } else {
        console.log('✅ Fetched shots:', data?.length || 0);
        setShots(data || []);
      }
    } catch (error) {
      console.error('Unexpected error fetching shots:', error);
      setShots([]);
    } finally {
      setLoading(false);
    }
  };

  let filtered = shots;
  if (statusFilter) filtered = filtered.filter(s => s.status === statusFilter);

  filtered = filtered.sort((a, b) => {
    let av: any = a[sortCol];
    let bv: any = b[sortCol];
    if (av < bv) return sortDir === "asc" ? -1 : 1;
    if (av > bv) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <div>
      <div className="flex flex-wrap gap-2 items-center mb-4">
        <span className="font-semibold text-gray-200">
          {userRole === 'artist' ? 'Your Assigned Shots' : 'Shots'}
        </span>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-gray-200"
        >
          {statusOptions.map(opt =>
            <option value={opt.value} key={opt.value}>{opt.label}</option>
          )}
        </select>
        <Button variant="ghost" size="sm"
          onClick={() => {
            setSortCol("frame_start");
            setSortDir(d => d === "asc" ? "desc" : "asc");
          }}
        >Frames {sortCol === "frame_start" && (sortDir === "asc" ? <SortAsc /> : <SortDesc />)}</Button>
        <Button variant="ghost" size="sm"
          onClick={() => {
            setSortCol("name");
            setSortDir(d => d === "asc" ? "desc" : "asc");
          }}
        >Name {sortCol === "name" && (sortDir === "asc" ? <SortAsc /> : <SortDesc />)}</Button>
      </div>
      
      {loading ? (
        <Loader2 className="animate-spin" />
      ) : (
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="text-gray-400">
              {userRole === 'artist' ? 'No assigned shots found.' : 'No shots found.'}
            </div>
          ) : (
            filtered.map(shot => (
              <div key={shot.id} className="border border-gray-700 rounded-lg bg-gray-900/30">
                <button 
                  className="w-full flex items-center gap-2 p-4 font-medium text-blue-200 hover:bg-gray-800/50 transition-colors"
                  onClick={() => setOpenShot(s => s === shot.id ? null : shot.id)}
                >
                  {openShot === shot.id
                    ? <ChevronDown className="w-4 h-4" />
                    : <ChevronRight className="w-4 h-4" />}
                  <span className="flex-1 text-left">{shot.name}</span>
                  <span className="ml-2 text-xs bg-gray-700 rounded px-2 py-0.5">{shot.status}</span>
                  <span className="ml-2 text-xs text-gray-400">{shot.frame_start}–{shot.frame_end}</span>
                </button>
                
                {openShot === shot.id && (
                  <div className="border-t border-gray-700 p-4">
                    <ShotTasksViewEnhanced 
                      shot={shot} 
                      userRole={userRole}
                      userId={userId}
                      onShareTask={onShareTask}
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
