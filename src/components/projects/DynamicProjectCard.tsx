import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  DollarSign, 
  Users, 
  Eye, 
  MessageSquare
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
      case 'open':
      case 'review':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'draft':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'completed':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
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

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button')) {
      return;
    }
    navigate(`/projects/${project.id}`);
  };

  const getBudgetDisplay = () => {
    if (project.budget_min && project.budget_max) {
      if (project.budget_min === project.budget_max) {
        return formatCurrency(project.budget_min);
      }
      return `${formatCurrency(project.budget_min)} - ${formatCurrency(project.budget_max)}`;
    }
    if (project.budget_min) {
      return `From ${formatCurrency(project.budget_min)}`;
    }
    if (project.budget_max) {
      return `Up to ${formatCurrency(project.budget_max)}`;
    }
    return null;
  };

  const budgetDisplay = getBudgetDisplay();

  return (
    <Card 
      className="bg-gray-900/50 border-gray-700 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 cursor-pointer"
      onClick={handleCardClick}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl font-bold text-white line-clamp-1">{project.title}</CardTitle>
            <CardDescription className="text-gray-400 mt-1 line-clamp-2">
              {project.description || "No description provided"}
            </CardDescription>
          </div>

          {showActions && (
             <Button 
                variant="outline" 
                size="sm"
                onClick={handleViewProject}
                className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="text-gray-300 space-y-4">
        {project.deadline && (
          <div>
            <div className="flex justify-between text-xs mb-1 text-gray-400">
              <span >Progress</span>
              <span className="text-white">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}
        
        {project.skills_required && project.skills_required.length > 0 && (
          <div>
            <p className="text-sm text-gray-400 mb-2">Skills Required:</p>
            <div className="flex flex-wrap gap-2">
              {project.skills_required.map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs bg-blue-500/20 text-blue-400">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {budgetDisplay && (
          <div className="flex items-center gap-2 text-green-400">
            <DollarSign className="h-4 w-4" />
            <span className="text-sm font-medium">
              {budgetDisplay}
            </span>
          </div>
        )}

        <div className="mt-3">
          <Badge className={`${getStatusColor(project.status || '')} capitalize`}>
            {project.status?.replace('_', ' ')}
          </Badge>
        </div>
      </CardContent>

      <CardFooter className="text-sm text-gray-500">
        <div className="flex flex-col w-full gap-3">
          {showActions && (
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
            </div>
          )}
          <div className="flex justify-between w-full">
            <span>Created {formatDate(project.created_at)}</span>
            {project.deadline && (
              <span className="text-orange-400">
                Due {formatDate(project.deadline)}
              </span>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default DynamicProjectCard;
