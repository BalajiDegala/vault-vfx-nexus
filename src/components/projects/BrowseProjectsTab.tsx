
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Filter, DollarSign, Calendar, MapPin, Briefcase, Eye } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import BidModal from "./BidModal";

type Project = Database["public"]["Tables"]["projects"]["Row"];
type AppRole = Database["public"]["Enums"]["app_role"];

interface BrowseProjectsTabProps {
  projects: Project[];
  userRole: AppRole | null;
  onUpdate: () => void;
}

const BrowseProjectsTab = ({ projects, userRole, onUpdate }: BrowseProjectsTabProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("open");
  const [showBidModal, setShowBidModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Filter projects for browsing (only open projects)
  const openProjects = projects.filter(project => project.status === "open");
  
  const filteredProjects = openProjects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const canBid = userRole === "artist";

  const handleBidClick = (project: Project) => {
    setSelectedProject(project);
    setShowBidModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          Browse Available Projects
        </h2>
        <p className="text-gray-400">
          Find and bid on projects that match your skills
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search projects by title, description, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-800/50 border-gray-600 text-white"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <Badge 
                variant="default"
                className="bg-green-600 text-white"
              >
                Open Projects ({filteredProjects.length})
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-20">
          <h3 className="text-xl font-bold text-white mb-4">
            {searchQuery ? "No Projects Found" : "No Open Projects Available"}
          </h3>
          <p className="text-gray-400">
            {searchQuery 
              ? "Try adjusting your search criteria" 
              : "Check back later for new project opportunities"}
          </p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card 
              key={project.id}
              className="bg-gray-900/50 border-gray-700 hover:border-blue-500/50 transition-all duration-300"
            >
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">{project.title}</h3>
                  <p className="text-gray-300 text-sm line-clamp-3">
                    {project.description}
                  </p>
                </div>

                {/* Budget */}
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
                      <span className="text-purple-400 text-sm font-medium">Skills:</span>
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

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  {canBid && (
                    <Button
                      size="sm"
                      className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                      onClick={() => handleBidClick(project)}
                    >
                      Place Bid
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Bid Modal */}
      {selectedProject && (
        <BidModal
          isOpen={showBidModal}
          onClose={() => {
            setShowBidModal(false);
            setSelectedProject(null);
          }}
          projectId={selectedProject.id}
          onSuccess={() => {
            setShowBidModal(false);
            setSelectedProject(null);
            onUpdate();
          }}
        />
      )}
    </div>
  );
};

export default BrowseProjectsTab;
