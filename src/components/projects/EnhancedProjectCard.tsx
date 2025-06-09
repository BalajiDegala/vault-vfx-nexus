
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, DollarSign, Users, Clock, Eye, Edit, MessageSquare, FileText, BarChart3 } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import ProjectHierarchy from "./ProjectHierarchy";
import BidModal from "./BidModal";

type Project = Database["public"]["Tables"]["projects"]["Row"];
type AppRole = Database["public"]["Enums"]["app_role"];

interface EnhancedProjectCardProps {
  project: Project;
  userRole: AppRole;
  userId: string;
  onUpdate: () => void;
}

const EnhancedProjectCard = ({ project, userRole, userId, onUpdate }: EnhancedProjectCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showBidModal, setShowBidModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const isOwner = project.client_id === userId;
  const canViewDetails = userRole === "admin" || isOwner || userRole === "producer" || userRole === "studio";
  const canBid = userRole === "artist" && !isOwner && project.status === "open";

  // Mock progress data - in real app would be calculated from tasks
  const mockProgress = {
    overall: 35,
    modeling: 80,
    animation: 20,
    lighting: 10,
    compositing: 0
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "in_progress": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "completed": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "review": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getSecurityLevelColor = (level: string) => {
    switch (level) {
      case "Standard": return "text-green-400";
      case "High": return "text-yellow-400";
      case "Enterprise": return "text-red-400";
      default: return "text-gray-400";
    }
  };

  const formatCurrency = (amount: number | null, currency: string = "V3C") => {
    if (!amount) return "N/A";
    return `${amount.toLocaleString()} ${currency}`;
  };

  const formatDeadline = (deadline: string | null) => {
    if (!deadline) return "No deadline";
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Overdue";
    if (diffDays === 0) return "Due today";
    if (diffDays === 1) return "Due tomorrow";
    return `${diffDays} days left`;
  };

  const getDeadlineUrgency = (deadline: string | null) => {
    if (!deadline) return "";
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "text-red-400";
    if (diffDays <= 3) return "text-orange-400";
    if (diffDays <= 7) return "text-yellow-400";
    return "text-green-400";
  };

  return (
    <>
      <Card className="bg-gray-900/80 border-blue-500/20 backdrop-blur-md hover:border-blue-400/40 transition-all duration-300 group">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                {project.title}
              </h3>
              
              <div className="flex items-center gap-3 mb-3">
                <Badge className={getStatusColor(project.status || "draft")}>
                  {(project.status || "draft").replace("_", " ")}
                </Badge>
                
                {project.security_level && (
                  <div className="flex items-center gap-1 text-sm">
                    <span className="text-gray-400">Security:</span>
                    <span className={getSecurityLevelColor(project.security_level)}>
                      {project.security_level}
                    </span>
                  </div>
                )}
              </div>

              <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                {project.description || "No description provided"}
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-green-400" />
                  <span className="text-gray-400">Budget:</span>
                  <span className="text-green-400 font-medium">
                    {formatCurrency(project.budget_min)} - {formatCurrency(project.budget_max)}
                  </span>
                </div>
                
                {project.deadline && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-orange-400" />
                    <span className="text-gray-400">Deadline:</span>
                    <span className={getDeadlineUrgency(project.deadline)}>
                      {formatDeadline(project.deadline)}
                    </span>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              {project.status === "in_progress" && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">Overall Progress</span>
                    <span className="text-sm text-blue-400 font-medium">{mockProgress.overall}%</span>
                  </div>
                  <Progress value={mockProgress.overall} className="h-2" />
                </div>
              )}

              {/* Skills */}
              {project.skills_required && project.skills_required.length > 0 && (
                <div className="mb-4">
                  <p className="text-gray-400 text-sm mb-2">Skills Required:</p>
                  <div className="flex flex-wrap gap-2">
                    {project.skills_required.slice(0, 3).map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs border-gray-600 text-gray-300">
                        {skill}
                      </Badge>
                    ))}
                    {project.skills_required.length > 3 && (
                      <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                        +{project.skills_required.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="flex gap-2">
            {canViewDetails && (
              <Button
                onClick={() => setShowDetails(true)}
                variant="outline"
                className="flex-1 border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
            )}
            
            {canBid && (
              <Button
                onClick={() => setShowBidModal(true)}
                className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Place Bid
              </Button>
            )}
            
            {isOwner && (
              <Button
                variant="outline"
                className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Details Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gray-900 border-blue-500/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
              {project.title}
              <Badge className={getStatusColor(project.status || "draft")}>
                {(project.status || "draft").replace("_", " ")}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-gray-800">
              <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600">
                <FileText className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="structure" className="data-[state=active]:bg-blue-600">
                <BarChart3 className="h-4 w-4 mr-2" />
                Structure
              </TabsTrigger>
              <TabsTrigger value="team" className="data-[state=active]:bg-blue-600">
                <Users className="h-4 w-4 mr-2" />
                Team
              </TabsTrigger>
              <TabsTrigger value="progress" className="data-[state=active]:bg-blue-600">
                <Clock className="h-4 w-4 mr-2" />
                Progress
              </TabsTrigger>
              <TabsTrigger value="communication" className="data-[state=active]:bg-blue-600">
                <MessageSquare className="h-4 w-4 mr-2" />
                Messages
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Project Details</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Budget Range:</span>
                        <span className="text-green-400 font-medium">
                          {formatCurrency(project.budget_min)} - {formatCurrency(project.budget_max)}
                        </span>
                      </div>
                      {project.deadline && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Deadline:</span>
                          <span className={getDeadlineUrgency(project.deadline)}>
                            {new Date(project.deadline).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-400">Security Level:</span>
                        <span className={getSecurityLevelColor(project.security_level || "Standard")}>
                          {project.security_level || "Standard"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Created:</span>
                        <span className="text-gray-300">
                          {new Date(project.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
                    <p className="text-gray-300 leading-relaxed">
                      {project.description || "No description provided"}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {project.skills_required && project.skills_required.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Required Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {project.skills_required.map((skill) => (
                          <Badge key={skill} variant="outline" className="border-gray-600 text-gray-300">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {project.data_layers && project.data_layers.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Data Layers</h3>
                      <div className="flex flex-wrap gap-2">
                        {project.data_layers.map((layer) => (
                          <Badge key={layer} variant="secondary" className="bg-purple-500/20 text-purple-400">
                            {layer}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="structure" className="mt-6">
              <ProjectHierarchy 
                project={project} 
                userRole={userRole} 
                userId={userId}
              />
            </TabsContent>

            <TabsContent value="team" className="mt-6">
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Team Management</h3>
                <p className="text-gray-400">Team assignment and collaboration features coming soon</p>
              </div>
            </TabsContent>

            <TabsContent value="progress" className="mt-6">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white">Progress Overview</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400">Overall Progress</span>
                        <span className="text-blue-400 font-medium">{mockProgress.overall}%</span>
                      </div>
                      <Progress value={mockProgress.overall} className="h-3" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400">Modeling</span>
                        <span className="text-green-400 font-medium">{mockProgress.modeling}%</span>
                      </div>
                      <Progress value={mockProgress.modeling} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400">Animation</span>
                        <span className="text-yellow-400 font-medium">{mockProgress.animation}%</span>
                      </div>
                      <Progress value={mockProgress.animation} className="h-2" />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400">Lighting</span>
                        <span className="text-orange-400 font-medium">{mockProgress.lighting}%</span>
                      </div>
                      <Progress value={mockProgress.lighting} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400">Compositing</span>
                        <span className="text-purple-400 font-medium">{mockProgress.compositing}%</span>
                      </div>
                      <Progress value={mockProgress.compositing} className="h-2" />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="communication" className="mt-6">
              <div className="text-center py-12">
                <MessageSquare className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Project Communication</h3>
                <p className="text-gray-400">Messaging and collaboration features coming soon</p>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Bid Modal */}
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

export default EnhancedProjectCard;
