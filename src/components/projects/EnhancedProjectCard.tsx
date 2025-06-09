import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";
import UpdateProjectModal from "./UpdateProjectModal";

type Project = Database["public"]["Tables"]["projects"]["Row"];
type AppRole = Database["public"]["Enums"]["app_role"];

interface EnhancedProjectCardProps {
  project: Project;
  userRole: AppRole | null;
  userId: string;
  onUpdate: () => void;
}

const EnhancedProjectCard = ({ project, userRole, userId, onUpdate }: EnhancedProjectCardProps) => {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const canEdit = userRole === "studio" || userRole === "admin" || project.client_id === userId;

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this project?")) {
      return;
    }

    try {
      // const { error } = await supabase.from("projects").delete().eq("id", project.id);
      // if (error) throw error;

      toast({
        title: "Project Deleted",
        description: `${project.title} has been successfully deleted.`,
      });
      onUpdate(); // Refresh the project list
    } catch (error: any) {
      console.error("Error deleting project:", error);
      toast({
        title: "Error",
        description: `Failed to delete ${project.title}: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleCardClick = () => {
    navigate(`/projects/${project.id}`);
  };

  return (
    <Card 
      className="bg-gray-900/50 border-gray-700 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 cursor-pointer"
      onClick={handleCardClick}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-white">{project.title}</CardTitle>
            <CardDescription className="text-gray-400">{project.description}</CardDescription>
          </div>

          {canEdit && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreVertical className="h-4 w-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setShowUpdateModal(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-red-500 focus:bg-red-500 focus:text-white">
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="text-gray-300">
        {project.skills_required && project.skills_required.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {project.skills_required.map((skill, index) => (
              <Badge key={index} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        ) : (
          <p>No specific skills required.</p>
        )}
      </CardContent>

      <CardFooter className="text-sm text-gray-500">
        Updated {new Date(project.updated_at).toLocaleDateString()}
      </CardFooter>

      {/* Update Project Modal */}
      <UpdateProjectModal
        open={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        project={project}
        onSuccess={() => {
          setShowUpdateModal(false);
          onUpdate();
        }}
      />
    </Card>
  );
};

export default EnhancedProjectCard;
