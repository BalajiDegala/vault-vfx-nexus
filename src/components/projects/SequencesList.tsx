
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import ShotsList from "./ShotsList";
import { Loader2, ChevronDown, ChevronRight, SortAsc, SortDesc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Database } from "@/integrations/supabase/types";

type Sequence = Database["public"]["Tables"]["sequences"]["Row"];

const sequenceStatusOptions = [
  { value: "", label: "All" },
  { value: "planning", label: "Planning" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" }
];

type SortCol = "name" | "status" | "order_index";
export default function SequencesList({ projectId }: { projectId: string }) {
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [openSeq, setOpenSeq] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortCol, setSortCol] = useState<SortCol>("order_index");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    setLoading(true);
    supabase
      .from("sequences")
      .select("*")
      .eq("project_id", projectId)
      .then(({ data }) => {
        setSequences(data || []);
        setLoading(false);
      });
  }, [projectId]);

  let filtered = sequences;
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
      <div className="flex flex-wrap gap-2 items-center mb-2">
        <span className="font-semibold text-gray-200">Sequences</span>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-gray-200"
        >
          {sequenceStatusOptions.map(opt =>
            <option value={opt.value} key={opt.value}>{opt.label}</option>
          )}
        </select>
        <Button variant="ghost" size="sm"
          onClick={() => {
            setSortCol("order_index");
            setSortDir(d => d === "asc" ? "desc" : "asc");
          }}
        >Order {sortCol === "order_index" && (sortDir === "asc" ? <SortAsc /> : <SortDesc />)}</Button>
        <Button variant="ghost" size="sm"
          onClick={() => {
            setSortCol("name");
            setSortDir(d => d === "asc" ? "desc" : "asc");
          }}
        >Name {sortCol === "name" && (sortDir === "asc" ? <SortAsc /> : <SortDesc />)}</Button>
      </div>
      {loading ? <Loader2 className="animate-spin" /> : (
        <ul>
          {filtered.length === 0 ? <li className="text-gray-400">No sequences found.</li>
            : filtered.map(seq =>
              <li key={seq.id} className="mb-2">
                <button className="flex items-center gap-2 font-medium text-blue-300"
                  onClick={() => setOpenSeq(s => s === seq.id ? null : seq.id)}
                >
                  {openSeq === seq.id
                    ? <ChevronDown className="w-4 h-4" />
                    : <ChevronRight className="w-4 h-4" />}
                  {seq.name}
                  <span className="ml-2 text-xs bg-gray-700 rounded px-2 py-0.5">{seq.status}</span>
                </button>
                {openSeq === seq.id && (
                  <div className="pl-6 mt-2">
                    <ShotsList sequenceId={seq.id} />
                  </div>
                )}
              </li>
            )}
        </ul>
      )}
    </div>
  );
}
