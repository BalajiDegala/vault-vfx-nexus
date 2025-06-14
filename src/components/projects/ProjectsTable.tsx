
import { useEffect, useState } from "react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Database } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Project = Database["public"]["Tables"]["projects"]["Row"];

const statusColor: Record<string, string> = {
  completed: "bg-blue-500/20 text-blue-400",
  open: "bg-green-500/20 text-green-400",
  draft: "bg-yellow-500/20 text-yellow-400",
  cancelled: "bg-red-500/20 text-red-400",
  review: "bg-cyan-500/20 text-cyan-400",
};

const ProjectsTable = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) setProjects(data);
      setLoading(false);
    };

    fetchProjects();
  }, []);

  return (
    <div className="bg-gray-900/50 border border-gray-700 rounded-xl overflow-x-auto mb-8">
      <Table>
        <TableCaption className="text-left px-4 py-2">All Projects ({projects.length})</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Budget</TableHead>
            <TableHead>Deadline</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Security Level</TableHead>
            <TableHead>Type</TableHead>
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
          ) : projects.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-gray-400">
                No projects found.
              </TableCell>
            </TableRow>
          ) : (
            projects.map((project) => (
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
