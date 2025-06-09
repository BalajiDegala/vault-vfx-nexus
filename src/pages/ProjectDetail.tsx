
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import PresenceIndicator from "@/components/collaboration/PresenceIndicator";
import ProjectChat from "@/components/collaboration/ProjectChat";
import { useProjectPresence } from "@/hooks/useProjectPresence";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, Users, Clock } from "lucide-react";

type Project = Database["public"]["Tables"]["projects"]["Row"];
type AppRole = Database["public"]["Enums"]["app_role"];

const ProjectDetail = () => {
  const { id } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<AppRole | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const { presenceUsers, updateSection } = useProjectPresence(id || '', user?.id || '');

  useEffect(() => {
    checkAuth();
  }, [id]);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/login");
        return;
      }

      setUser(session.user);

      // Get user role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .single();

      if (roleData) {
        setUserRole(roleData.role);
        fetchProject();
      }
    } catch (error) {
      console.error("Auth check error:", error);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchProject = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching project:", error);
        toast({
          title: "Error",
          description: "Failed to load project",
          variant: "destructive",
        });
        return;
      }

      setProject(data);
      updateSection('overview');
    } catch (error) {
      console.error("Error fetching project:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-500/20 text-green-400';
      case 'in_progress': return 'bg-blue-500/20 text-blue-400';
      case 'completed': return 'bg-purple-500/20 text-purple-400';
      case 'review': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!user || !userRole || !project) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      <DashboardNavbar user={user} userRole={userRole} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header with Presence */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{project.title}</h1>
              <p className="text-gray-400 mb-4">{project.description}</p>
              
              <div className="flex items-center gap-4">
                <Badge className={getStatusColor(project.status || 'draft')}>
                  {project.status || 'draft'}
                </Badge>
                
                {project.deadline && (
                  <div className="flex items-center gap-1 text-gray-400">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">Due: {new Date(project.deadline).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>

            <PresenceIndicator users={presenceUsers} />
          </div>
        </div>

        {/* Project Details Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
                  <Badge key={index} variant="outline" className="text-xs">
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

        {/* Project Content Area */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
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
                        {/* Render milestones if they exist */}
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

          <div>
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Team Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {presenceUsers.length > 0 ? (
                    presenceUsers.map((user) => {
                      const fullName = `${user.profile?.first_name || ''} ${user.profile?.last_name || ''}`.trim();
                      return (
                        <div key={user.user_id} className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            user.status === 'online' ? 'bg-green-400' : 'bg-yellow-400'
                          }`} />
                          <div>
                            <p className="text-white text-sm">{fullName}</p>
                            <p className="text-gray-400 text-xs">
                              {user.status} • {user.current_section}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-400">No team members online</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Real-time Chat */}
      <ProjectChat projectId={id || ''} userId={user.id} />
    </div>
  );
};

export default ProjectDetail;
