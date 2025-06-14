
import { useEffect, useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Database } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowUp, ArrowDown, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Project = Database["public"]["Tables"]["projects"]["Row"];

const statusColor: Record<string, string> = {
  completed: "bg-blue-500/20 text-blue-400",
  open: "bg-green-500/20 text-green-400",
  draft: "bg-yellow-500/20 text-yellow-400",
  cancelled: "bg-red-500/20 text-red-400",
  review: "bg-cyan-500/20 text-cyan-400",
};

const statusOptions = [
  { value: "", label: "All" },
  { value: "open", label: "Open" },
  { value: "completed", label: "Completed" },
  { value: "draft", label: "Draft" },
  { value: "cancelled", label: "Cancelled" },
  { value: "review", label: "Review" },
];
const typeOptions = [
  { value: "", label: "All" },
  { value: "studio", label: "Studio" },
  { value: "personal", label: "Personal" },
  { value: "freelance", label: "Freelance" },
  { value: "test", label: "Test" },
];

type SortColumn = "title" | "status" | "budget" | "deadline" | "assigned_to" | "security_level" | "project_type";

const ProjectsTable = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // filter and sort state
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sortColumn, setSortColumn] = useState<SortColumn>("deadline");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("projects")
        .select("*");
      if (!error && data) setProjects(data);
      setLoading(false);
    };

    fetchProjects();
  }, []);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Filtered and sorted projects, in-memory for best UX
  const filteredProjects = useMemo(() => {
    let result = [...projects];
    if (statusFilter) {
      result = result.filter((p) => p.status === statusFilter);
    }
    if (typeFilter) {
      result = result.filter((p) => (p.project_type ?? "studio") === typeFilter);
    }
    return result;
  }, [projects, statusFilter, typeFilter]);

  const sortedProjects = useMemo(() => {
    let proj = [...filteredProjects];
    proj.sort((a, b) => {
      let aVal: any = a[sortColumn];
      let bVal: any = b[sortColumn];

      // Special sorting logic
      if (sortColumn === "budget") {
        aVal = ((a.budget_min ?? 0) + (a.budget_max ?? 0)) / 2;
        bVal = ((b.budget_min ?? 0) + (b.budget_max ?? 0)) / 2;
      }
      if (sortColumn === "assigned_to") {
        aVal = !!a.assigned_to;
        bVal = !!b.assigned_to;
      }
      if (sortColumn === "deadline") {
        // Sort by deadline as date, treat missing as far future
        aVal = a.deadline ? new Date(a.deadline).getTime() : Number.MAX_SAFE_INTEGER;
        bVal = b.deadline ? new Date(b.deadline).getTime() : Number.MAX_SAFE_INTEGER;
      }

      if (aVal === undefined || aVal === null) aVal = "";
      if (bVal === undefined || bVal === null) bVal = "";

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return proj;
  }, [filteredProjects, sortColumn, sortDirection]);

  return (
    <div className="bg-gray-900/50 border border-gray-700 rounded-xl overflow-x-auto mb-8 p-4">
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 mr-1 text-gray-400" />
          <span className="text-gray-300 font-semibold mr-2">Status</span>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 h-8 bg-gray-800 border-gray-700 text-white">
              <SelectValue>{statusOptions.find(o => o.value === statusFilter)?.label}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-300 font-semibold mr-2">Type</span>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-32 h-8 bg-gray-800 border-gray-700 text-white">
              <SelectValue>{typeOptions.find(o => o.value === typeFilter)?.label}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {typeOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <Table>
        <TableCaption className="text-left px-4 py-2">All Projects ({sortedProjects.length})</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead
              className="cursor-pointer select-none"
              onClick={() => handleSort("title")}
            >
              Title
              {sortColumn === "title" && (sortDirection === "asc" ? <ArrowUp className="inline ml-1 w-4 h-4" /> : <ArrowDown className="inline ml-1 w-4 h-4" />)}
            </TableHead>
            <TableHead
              className="cursor-pointer select-none"
              onClick={() => handleSort("status")}
            >
              Status
              {sortColumn === "status" && (sortDirection === "asc" ? <ArrowUp className="inline ml-1 w-4 h-4" /> : <ArrowDown className="inline ml-1 w-4 h-4" />)}
            </TableHead>
            <TableHead
              className="cursor-pointer select-none"
              onClick={() => handleSort("budget")}
            >
              Budget
              {sortColumn === "budget" && (sortDirection === "asc" ? <ArrowUp className="inline ml-1 w-4 h-4" /> : <ArrowDown className="inline ml-1 w-4 h-4" />)}
            </TableHead>
            <TableHead
              className="cursor-pointer select-none"
              onClick={() => handleSort("deadline")}
            >
              Deadline
              {sortColumn === "deadline" && (sortDirection === "asc" ? <ArrowUp className="inline ml-1 w-4 h-4" /> : <ArrowDown className="inline ml-1 w-4 h-4" />)}
            </TableHead>
            <TableHead
              className="cursor-pointer select-none"
              onClick={() => handleSort("assigned_to")}
            >
              Assigned To
              {sortColumn === "assigned_to" && (sortDirection === "asc" ? <ArrowUp className="inline ml-1 w-4 h-4" /> : <ArrowDown className="inline ml-1 w-4 h-4" />)}
            </TableHead>
            <TableHead
              className="cursor-pointer select-none"
              onClick={() => handleSort("security_level")}
            >
              Security Level
              {sortColumn === "security_level" && (sortDirection === "asc" ? <ArrowUp className="inline ml-1 w-4 h-4" /> : <ArrowDown className="inline ml-1 w-4 h-4" />)}
            </TableHead>
            <TableHead
              className="cursor-pointer select-none"
              onClick={() => handleSort("project_type")}
            >
              Type
              {sortColumn === "project_type" && (sortDirection === "asc" ? <ArrowUp className="inline ml-1 w-4 h-4" /> : <ArrowDown className="inline ml-1 w-4 h-4" />)}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                <Loader2 className="inline-block animate-spin text-blue-400 mx-1" />
                Loading projects...
              </TableCell>
            </TableRow>
          ) : sortedProjects.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-gray-400">
                No projects found.
              </TableCell>
            </TableRow>
          ) : (
            sortedProjects.map((project) => (
              <TableRow key={project.id} className="hover:bg-gray-800/50 transition-colors cursor-pointer">
                <TableCell className="font-medium text-white">{project.title}</TableCell>
                <TableCell>
                  <Badge className={statusColor[project.status ?? "draft"] ?? "bg-gray-500/20 text-gray-400"}>
                    {project.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {project.budget_min && project.budget_max
                    ? `${project.budget_min}–${project.budget_max} ${project.currency ?? "V3C"}`
                    : "—"}
                </TableCell>
                <TableCell>
                  {project.deadline ? new Date(project.deadline).toLocaleDateString() : "—"}
                </TableCell>
                <TableCell>
                  {project.assigned_to
                    ? <span className="text-blue-300">Assigned</span>
                    : <span className="text-gray-400">Unassigned</span>}
                </TableCell>
                <TableCell>{project.security_level ?? "Standard"}</TableCell>
                <TableCell className="capitalize">{project.project_type ?? "studio"}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProjectsTable;
