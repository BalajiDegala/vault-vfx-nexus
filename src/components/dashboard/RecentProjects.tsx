
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  FolderOpen, 
  Clock
} from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
}

interface RecentProjectsProps {
  recentProjects: Project[];
  canCreateProject: boolean;
  onCreateProject: () => void;
  onProjectClick: (projectId: string) => void;
}

const RecentProjects = ({ 
  recentProjects, 
  canCreateProject, 
  onCreateProject, 
  onProjectClick 
}: RecentProjectsProps) => {
  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-400" />
          Recent Projects
        </CardTitle>
        <CardDescription className="text-gray-400">
          Your latest project activity
        </CardDescription>
      </CardHeader>
      <CardContent>
        {recentProjects.length === 0 ? (
          <div className="text-center py-8">
            <FolderOpen className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No projects yet</p>
            {canCreateProject && (
              <Button onClick={onCreateProject} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Project
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {recentProjects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors cursor-pointer"
                onClick={() => onProjectClick(project.id)}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <FolderOpen className="h-8 w-8 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{project.title}</h4>
                    <p className="text-gray-400 text-sm">{project.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant={project.status === 'in_progress' ? 'default' : 'secondary'}>
                    {project.status}
                  </Badge>
                  <span className="text-gray-400 text-sm">
                    {new Date(project.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentProjects;
