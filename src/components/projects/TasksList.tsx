
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, SortAsc, SortDesc } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { Badge } from "@/components/ui/badge";

type Task = Database["public"]["Tables"]["tasks"]["Row"];

const priorityOrder: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };

type SortCol = "name" | "priority" | "task_type" | "status";
const statusOptions = [
  { value: "", label: "All" },
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "review", label: "Review" },
  { value: "completed", label: "Completed" },
];
const typeOptions = [
  { value: "", label: "All" },
  { value: "modeling", label: "Modeling" },
  { value: "animation", label: "Animation" },
  { value: "lighting", label: "Lighting" },
  { value: "compositing", label: "Compositing" },
  { value: "fx", label: "FX" }
];

export default function TasksList({ shotId }: { shotId: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortCol, setSortCol] = useState<SortCol>("priority");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  useEffect(() => {
    setLoading(true);
    supabase
      .from("tasks")
      .select("*")
      .eq("shot_id", shotId)
      .then(({ data }) => {
        setTasks(data || []);
        setLoading(false);
      });
  }, [shotId]);

  let filtered = tasks;
  if (statusFilter) filtered = filtered.filter(t => t.status === statusFilter);
  if (typeFilter) filtered = filtered.filter(t => t.task_type === typeFilter);

  filtered = filtered.sort((a, b) => {
    const av: any = a[sortCol];
    const bv: any = b[sortCol];
    if (sortCol === "priority") {
      av = priorityOrder[a.priority] || 0;
      bv = priorityOrder[b.priority] || 0;
    }
    if (av < bv) return sortDir === "asc" ? -1 : 1;
    if (av > bv) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <div>
      <div className="flex flex-wrap gap-2 items-center mb-2">
        <span className="font-semibold text-gray-200">Tasks</span>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-gray-200"
        >
          {statusOptions.map(opt =>
            <option value={opt.value} key={opt.value}>{opt.label}</option>
          )}
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-gray-200"
        >
          {typeOptions.map(opt =>
            <option value={opt.value} key={opt.value}>{opt.label}</option>
          )}
        </select>
        <button className="ml-2 text-xs"
          onClick={() => {
            setSortCol("priority");
            setSortDir(d => d === "asc" ? "desc" : "asc");
          }}
        >Priority {sortCol === "priority" && (sortDir === "asc" ? <SortAsc /> : <SortDesc />)}</button>
        <button className="ml-2 text-xs"
          onClick={() => {
            setSortCol("name");
            setSortDir(d => d === "asc" ? "desc" : "asc");
          }}
        >Name {sortCol === "name" && (sortDir === "asc" ? <SortAsc /> : <SortDesc />)}</button>
      </div>
      {loading ? <Loader2 className="animate-spin" /> : (
        <ul>
          {filtered.length === 0 ? <li className="text-gray-400">No tasks found.</li>
            : filtered.map(task => (
              <li key={task.id} className="flex gap-2 mb-2 items-center">
                <Badge className="bg-blue-800/30 text-xs mr-2">{task.task_type}</Badge>
                <span className="font-semibold text-white">{task.name}</span>
                <span className="bg-gray-700 rounded text-xs px-2 py-0.5 ml-2">{task.status}</span>
                <span className={`ml-2 text-xs ${task.priority === "critical" ? "text-red-600" : task.priority === "high" ? "text-orange-400" : ""}`}>{task.priority}</span>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
