
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, DollarSign, Users, Target, Zap } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type Project = Database["public"]["Tables"]["projects"]["Row"];

interface ProjectOverviewProps {
  project: Project;
}

const ProjectOverview = ({ project }: ProjectOverviewProps) => {
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
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Calculate project progress based on creation date and deadline
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

  // Calculate budget display value
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
    return 'Not specified';
  };

  const budgetDisplay = getBudgetDisplay();

  return (
    <div className="space-y-6">
      {/* Project Header Info */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-gray-900/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Target className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Status</p>
                <Badge className={`${getStatusColor(project.status)} capitalize`}>
                  {project.status?.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Budget</p>
                <p className="text-white font-semibold">
                  {budgetDisplay}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Zap className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Currency</p>
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 capitalize">
                  {project.currency || 'V3C'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Details */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-400" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Progress</span>
                <span className="text-white">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Start Date</span>
                <span className="text-white">{formatDate(project.created_at)}</span>
              </div>
              {project.deadline && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Deadline</span>
                  <span className="text-white">{formatDate(project.deadline)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-green-400" />
              Project Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm">Description</label>
              <p className="text-white mt-1 leading-relaxed">
                {project.description || 'No description provided'}
              </p>
            </div>
            
            {project.skills_required && project.skills_required.length > 0 && (
              <div>
                <label className="text-gray-400 text-sm">Skills Required</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {project.skills_required.map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-blue-400 border-blue-500/30">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {project.data_layers && project.data_layers.length > 0 && (
              <div>
                <label className="text-gray-400 text-sm">Data Layers</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {project.data_layers.map((layer, index) => (
                    <Badge key={index} variant="outline" className="text-purple-400 border-purple-500/30">
                      {layer}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Project Statistics */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-400" />
            Project Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">0</div>
              <div className="text-gray-400 text-sm">Sequences</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">0</div>
              <div className="text-gray-400 text-sm">Shots</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">0</div>
              <div className="text-gray-400 text-sm">Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">0</div>
              <div className="text-gray-400 text-sm">Files</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectOverview;
