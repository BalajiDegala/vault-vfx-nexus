
import logger from "@/lib/logger";
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChevronDown, ChevronRight, Loader2, SortAsc, SortDesc, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Database } from "@/integrations/supabase/types";
import ShotTasksViewEnhanced from "./ShotTasksViewEnhanced";
import CreateShotModal from "./CreateShotModal";

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
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchShots();
  }, [sequenceId, userRole, userId]);

  const fetchShots = async () => {
    try {
      logger.log('🔍 Fetching shots for sequence:', sequenceId, 'userRole:', userRole);
      
      if (userRole === 'artist') {
        // For artists, only show shots that have tasks shared with them
        const { data: sharedTasks, error: sharedError } = await supabase
          .from('shared_tasks')
          .select(`
            task_id,
            status,
            tasks!inner (
              id,
              shot_id,
              shots!inner (
                id,
                name,
                description,
                status,
                frame_start,
                frame_end,
                sequence_id,
                assigned_to,
                created_at,
                updated_at
              )
            )
          `)
          .eq('artist_id', userId)
          .eq('status', 'approved')
          .eq('tasks.shots.sequence_id', sequenceId);

        if (sharedError) {
          logger.error('Error fetching shared tasks for shots:', sharedError);
          setShots([]);
          return;
        }

        // Extract unique shots from shared tasks
        const uniqueShots = new Map();
        sharedTasks?.forEach(sharedTask => {
          const shot = sharedTask.tasks?.shots;
          if (shot) {
            uniqueShots.set(shot.id, shot);
          }
        });

        const artistShots = Array.from(uniqueShots.values());
        logger.log('✅ Artist shots with shared tasks:', artistShots.length);
        setShots(artistShots);
      } else {
        // For studios/admins, show all shots in the sequence
        const { data, error } = await supabase
          .from("shots")
          .select("*")
          .eq("sequence_id", sequenceId)
          .order('frame_start');

        if (error) {
          logger.error('Error fetching shots:', error);
          setShots([]);
        } else {
          logger.log('✅ All shots fetched:', data?.length || 0);
          setShots(data || []);
        }
      }
    } catch (error) {
      logger.error('Unexpected error fetching shots:', error);
      setShots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShot = () => {
    logger.log('🎬 Opening create shot modal for sequence:', sequenceId);
    setShowCreateModal(true);
  };

  const handleShotCreated = () => {
    logger.log('✅ Shot created, refreshing list');
    fetchShots();
  };

  const canCreateShots = userRole === 'studio' || userRole === 'admin' || userRole === 'producer';

  logger.log('🎬 ShotsListEnhanced render - userRole:', userRole, 'canCreateShots:', canCreateShots);

  let filtered = shots;
  if (statusFilter) filtered = filtered.filter(s => s.status === statusFilter);

  filtered = filtered.sort((a, b) => {
    const av: any = a[sortCol];
    const bv: any = b[sortCol];
    if (av < bv) return sortDir === "asc" ? -1 : 1;
    if (av > bv) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <div>
      <div className="flex flex-wrap gap-2 items-center justify-between mb-4">
        <div className="flex flex-wrap gap-2 items-center">
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
        
        {canCreateShots && (
          <Button
            variant="outline"
            size="sm"
            className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
            onClick={handleCreateShot}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Shot
          </Button>
        )}
      </div>
      
      {loading ? (
        <Loader2 className="animate-spin" />
      ) : (
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              {userRole === 'artist' ? 'No assigned shots found in this sequence.' : 'No shots found.'}
              {canCreateShots && !statusFilter && (
                <div className="mt-2">
                  <Button
                    variant="outline"
                    className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                    onClick={handleCreateShot}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Shot
                  </Button>
                </div>
              )}
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

      <CreateShotModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        sequenceId={sequenceId}
        onSuccess={handleShotCreated}
      />
    </div>
  );
}
