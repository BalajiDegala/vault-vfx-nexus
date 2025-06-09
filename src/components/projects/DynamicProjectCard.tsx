
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  Users, 
  Eye, 
  MessageSquare,
  Star,
  ArrowRight
} from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { useNavigate } from "react-router-dom";

type Project = Database["public"]["Tables"]["projects"]["Row"];

interface DynamicProjectCardProps {
  project: Project;
  showActions?: boolean;
}

const DynamicProjectCard = ({ project, showActions = true }: DynamicProjectCardProps) => {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'in_progress':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'completed':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-400';
      case 'high':
        return 'text-orange-400';
      case 'medium':
        return 'text-yellow-400';
      case 'low':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact'
    }).format(amount);
  };

  const calculateProgress = () => {
    if (!project.deadline) return 0;
    
    const start = new Date(project.created_at);
    const end = new Date(project.deadline);
    const now = new Date();
    
    const totalDuration = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    
    return Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
  };

  const progress = calculateProgress();

  const handleViewProject = () => {
    navigate(`/projects/${project.id}`);
  };

  return (
    <Card className="bg-gray-900/50 border-gray-700 hover:border-gray-600 transition-all duration-200 hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Star className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white line-clamp-1">{project.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={`${getStatusColor(project.status)} text-xs capitalize`}>
                  {project.status?.replace('_', ' ')}
                </Badge>
                <div className={`flex items-center gap-1 ${getPriorityColor(project.priority)}`}>
                  <div className="w-2 h-2 rounded-full bg-current"></div>
                  <span className="text-xs capitalize">{project.priority}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <p className="text-gray-300 text-sm line-clamp-2 leading-relaxed">
          {project.description || 'No description provided'}
        </p>

        {/* Progress */}
        {project.deadline && (
          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-gray-400">Progress</span>
              <span className="text-white">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}

        {/* Project Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            {project.budget ? (
              <>
                <DollarSign className="h-4 w-4 text-green-400" />
                <span className="text-green-400 text-sm font-medium">
                  {formatCurrency(project.budget)}
                </span>
              </>
            ) : (
              <>
                <DollarSign className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400 text-sm">Budget TBD</span>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-gray-300 text-sm">
              {formatDate(project.created_at)}
            </span>
          </div>
        </div>

        {/* Skills */}
        {project.skills_required && project.skills_required.length > 0 && (
          <div>
            <p className="text-gray-400 text-xs mb-2">Skills Required</p>
            <div className="flex flex-wrap gap-1">
              {project.skills_required.slice(0, 3).map((skill, index) => (
                <Badge key={index} variant="outline" className="text-xs text-blue-400 border-blue-500/30">
                  {skill}
                </Badge>
              ))}
              {project.skills_required.length > 3 && (
                <Badge variant="outline" className="text-xs text-gray-400 border-gray-500/30">
                  +{project.skills_required.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Deadline */}
        {project.deadline && (
          <div className="flex items-center gap-2 text-orange-400">
            <Clock className="h-4 w-4" />
            <span className="text-sm">Due {formatDate(project.deadline)}</span>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="pt-2 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-gray-400">
                  <Eye className="h-4 w-4" />
                  <span className="text-xs">0 views</span>
                </div>
                <div className="flex items-center gap-1 text-gray-400">
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-xs">0 comments</span>
                </div>
                <div className="flex items-center gap-1 text-gray-400">
                  <Users className="h-4 w-4" />
                  <span className="text-xs">1 member</span>
                </div>
              </div>
              
              <Button 
                size="sm" 
                onClick={handleViewProject}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                View <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DynamicProjectCard;
