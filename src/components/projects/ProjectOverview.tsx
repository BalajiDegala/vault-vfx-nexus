
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Users, Clock } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type Project = Database["public"]["Tables"]["projects"]["Row"];

interface ProjectOverviewProps {
  project: Project;
}

const ProjectOverview = ({ project }: ProjectOverviewProps) => {
  return (
    <div className="space-y-6">
      {/* Project Details Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-400" />
              Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {project.budget_min && project.budget_max && (
                <p className="text-gray-300">
                  {project.currency || 'V3C'} {project.budget_min} - {project.budget_max}
                </p>
              )}
              {!project.budget_min && !project.budget_max && (
                <p className="text-gray-400">Budget not specified</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-400" />
              Skills Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {project.skills_required?.map((skill, index) => (
                <Badge key={index} variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/50">
                  {skill}
                </Badge>
              )) || <p className="text-gray-400">No specific skills required</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-400" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-gray-300">
                Created: {new Date(project.created_at).toLocaleDateString()}
              </p>
              <p className="text-gray-300">
                Updated: {new Date(project.updated_at).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Layers Section */}
      {project.data_layers && project.data_layers.length > 0 && (
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Data Layers Required</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {project.data_layers.map((layer, index) => (
                <Badge key={index} variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/50">
                  {layer}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Project Content Area */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Project Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
              <p className="text-gray-300">{project.description || 'No description provided'}</p>
            </div>

            {project.milestones && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Milestones</h3>
                <div className="space-y-2">
                  <p className="text-gray-400">Milestone tracking coming soon...</p>
                </div>
              </div>
            )}

            {project.attachments && project.attachments.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Attachments</h3>
                <div className="space-y-2">
                  {project.attachments.map((attachment, index) => (
                    <div key={index} className="text-blue-400 hover:underline cursor-pointer">
                      {attachment}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectOverview;
