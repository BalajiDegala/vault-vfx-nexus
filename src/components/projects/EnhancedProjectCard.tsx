
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
import { MoreVertical, Edit, Trash2, Eye } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
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
      console.log("Deleting project:", project.id);
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", project.id);

      if (error) throw error;

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

  const handleViewProject = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Navigating to project:", project.id);
    navigate(`/projects/${project.id}`);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on buttons or dropdown
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[role="button"]') || 
        target.closest('.dropdown-trigger')) {
      return;
    }
    console.log("Card clicked, navigating to project:", project.id);
    navigate(`/projects/${project.id}`);
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'V3C' ? 'USD' : currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card 
      className="bg-gray-900/50 border-gray-700 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 cursor-pointer"
      onClick={handleCardClick}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl font-bold text-white">{project.title}</CardTitle>
            <CardDescription className="text-gray-400 mt-1">
              {project.description || "No description provided"}
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            {/* View Button */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleViewProject}
              className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>

            {/* Edit/Delete Dropdown for authorized users */}
            {canEdit && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="h-8 w-8 p-0 dropdown-trigger"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="sr-only">Open menu</span>
                    <MoreVertical className="h-4 w-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowUpdateModal(true);
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete();
                    }} 
                    className="text-red-500 focus:bg-red-500 focus:text-white"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="text-gray-300">
        {/* Skills Required */}
        {project.skills_required && project.skills_required.length > 0 ? (
          <div className="space-y-2 mb-4">
            <p className="text-sm text-gray-400">Skills Required:</p>
            <div className="flex flex-wrap gap-2">
              {project.skills_required.map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs bg-blue-500/20 text-blue-400">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-gray-500 mb-4">No specific skills required.</p>
        )}

        {/* Budget Information */}
        {(project.budget_min || project.budget_max) && (
          <div className="mb-4 flex items-center gap-2 text-green-400">
            <span className="text-sm">Budget:</span>
            {project.budget_min && project.budget_max ? (
              <span className="font-medium">
                {formatCurrency(project.budget_min)} - {formatCurrency(project.budget_max)}
              </span>
            ) : project.budget_min ? (
              <span className="font-medium">From {formatCurrency(project.budget_min)}</span>
            ) : project.budget_max ? (
              <span className="font-medium">Up to {formatCurrency(project.budget_max)}</span>
            ) : null}
            {project.currency && project.currency !== 'USD' && (
              <span className="text-xs text-gray-400">({project.currency})</span>
            )}
          </div>
        )}

        {/* Project Status */}
        <div className="mt-3">
          <Badge 
            className={
              project.status === "open" ? "bg-green-500/20 text-green-400" :
              project.status === "in_progress" ? "bg-blue-500/20 text-blue-400" :
              project.status === "completed" ? "bg-purple-500/20 text-purple-400" :
              "bg-gray-500/20 text-gray-400"
            }
          >
            {project.status?.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
      </CardContent>

      <CardFooter className="text-sm text-gray-500">
        <div className="flex justify-between w-full">
          <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
          {project.deadline && (
            <span className="text-orange-400">
              Due {new Date(project.deadline).toLocaleDateString()}
            </span>
          )}
        </div>
      </CardFooter>

      {/* Update Project Modal */}
      <UpdateProjectModal
        open={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        project={project}
        onSuccess={() => {
          setShowUpdateModal(false);
          onUpdate();
          toast({
            title: "Success",
            description: "Project updated successfully!",
          });
        }}
      />
    </Card>
  );
};

export default EnhancedProjectCard;
