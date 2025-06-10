
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Calendar, 
  Clock, 
  CheckCircle, 
  PlayCircle, 
  PauseCircle,
  FileText,
  MessageSquare 
} from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type Project = Database["public"]["Tables"]["projects"]["Row"];
type AppRole = Database["public"]["Enums"]["app_role"];

interface MyWorkTabProps {
  projects: Project[];
  userRole: AppRole | null;
  userId: string;
  onUpdate: () => void;
}

const MyWorkTab = ({ projects, userRole, userId, onUpdate }: MyWorkTabProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Filter projects for work management (assigned projects)
  const workProjects = projects.filter(project => 
    project.assigned_to === userId || 
    (userRole !== 'artist' && project.client_id === userId && project.status !== 'open')
  );

  const filteredProjects = workProjects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusOptions = [
    { value: "all", label: "All", count: workProjects.length },
    { value: "in_progress", label: "In Progress", count: workProjects.filter(p => p.status === "in_progress").length },
    { value: "review", label: "Review", count: workProjects.filter(p => p.status === "review").length },
    { value: "completed", label: "Completed", count: workProjects.filter(p => p.status === "completed").length },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "in_progress": return <PlayCircle className="h-4 w-4" />;
      case "review": return <PauseCircle className="h-4 w-4" />;
      case "completed": return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_progress": return "bg-blue-500";
      case "review": return "bg-yellow-500";
      case "completed": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          My Work Dashboard
        </h2>
        <p className="text-gray-400">
          Manage your assigned projects and tasks
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search your projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-800/50 border-gray-600 text-white"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {statusOptions.map((option) => (
                <Badge
                  key={option.value}
                  variant={statusFilter === option.value ? "default" : "outline"}
                  className={`cursor-pointer transition-colors ${
                    statusFilter === option.value 
                      ? "bg-blue-600 text-white" 
                      : "border-gray-600 text-gray-300 hover:bg-gray-700"
                  }`}
                  onClick={() => setStatusFilter(option.value)}
                >
                  {option.label} ({option.count})
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Work Projects */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-20">
          <h3 className="text-xl font-bold text-white mb-4">
            {searchQuery || statusFilter !== "all" ? "No Projects Found" : "No Active Work"}
          </h3>
          <p className="text-gray-400">
            {searchQuery || statusFilter !== "all" 
              ? "Try adjusting your search criteria or filters" 
              : userRole === "artist" 
                ? "Win some bids to start working on projects!" 
                : "Create projects and assign them to start seeing work here"}
          </p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card 
              key={project.id}
              className="bg-gray-900/50 border-gray-700 hover:border-green-500/50 transition-all duration-300"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold text-white">
                    {project.title}
                  </CardTitle>
                  <Badge className={`${getStatusColor(project.status || "")} text-white flex items-center gap-1`}>
                    {getStatusIcon(project.status || "")}
                    {project.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-gray-300 text-sm line-clamp-3">
                  {project.description}
                </p>

                {/* Project Info */}
                <div className="space-y-2">
                  {project.deadline && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-orange-400" />
                      <span className="text-orange-400 text-sm">
                        Due: {formatDate(project.deadline)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-400 text-sm">
                      Updated: {formatDate(project.updated_at)}
                    </span>
                  </div>
                </div>

                {/* Skills */}
                {project.skills_required && project.skills_required.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {project.skills_required.slice(0, 3).map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {project.skills_required.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{project.skills_required.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    View Tasks
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-green-500/50 text-green-400 hover:bg-green-500/10"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Chat
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyWorkTab;
