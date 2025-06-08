
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, Calendar, MapPin, Briefcase } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import BidModal from "./BidModal";

type Project = Database["public"]["Tables"]["projects"]["Row"];
type AppRole = Database["public"]["Enums"]["app_role"];

interface ProjectCardProps {
  project: Project;
  userRole: AppRole;
  onUpdate: () => void;
}

const ProjectCard = ({ project, userRole, onUpdate }: ProjectCardProps) => {
  const [showBidModal, setShowBidModal] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-green-500";
      case "in_progress": return "bg-blue-500";
      case "completed": return "bg-purple-500";
      case "cancelled": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const canBid = userRole === "artist" && project.status === "open";

  return (
    <>
      <Card className="bg-gray-900/80 border-blue-500/20 hover:border-blue-400/40 transition-all duration-300">
        <CardHeader>
          <div className="flex justify-between items-start mb-2">
            <CardTitle className="text-lg font-bold text-white line-clamp-2">
              {project.title}
            </CardTitle>
            <Badge className={`${getStatusColor(project.status || "")} text-white`}>
              {project.status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-gray-300 text-sm line-clamp-3">
            {project.description}
          </p>

          {/* Budget Range */}
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-green-400" />
            <span className="text-green-400 font-semibold">
              {project.budget_min?.toLocaleString()} - {project.budget_max?.toLocaleString()} {project.currency}
            </span>
          </div>

          {/* Deadline */}
          {project.deadline && (
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-orange-400" />
              <span className="text-orange-400 text-sm">
                Due: {formatDate(project.deadline)}
              </span>
            </div>
          )}

          {/* Skills Required */}
          {project.skills_required && project.skills_required.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Briefcase className="h-4 w-4 text-purple-400" />
                <span className="text-purple-400 text-sm font-medium">Skills Required:</span>
              </div>
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
            </div>
          )}

          {/* Security Level */}
          {project.security_level && (
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-blue-400" />
              <span className="text-blue-400 text-sm">
                Security: {project.security_level}
              </span>
            </div>
          )}

          {/* Posted Date */}
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-gray-400 text-sm">
              Posted: {formatDate(project.created_at)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
            >
              View Details
            </Button>
            {canBid && (
              <Button
                size="sm"
                className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                onClick={() => setShowBidModal(true)}
              >
                Place Bid
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <BidModal
        open={showBidModal}
        onClose={() => setShowBidModal(false)}
        project={project}
        onSuccess={() => {
          setShowBidModal(false);
          onUpdate();
        }}
      />
    </>
  );
};

export default ProjectCard;
