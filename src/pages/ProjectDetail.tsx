
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import PresenceIndicator from "@/components/collaboration/PresenceIndicator";
import ProjectChat from "@/components/collaboration/ProjectChat";
import ProjectHierarchy from "@/components/projects/ProjectHierarchy";
import { useProjectPresence } from "@/hooks/useProjectPresence";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, DollarSign, Users, Clock, FileText, MessageSquare, Upload, File, Download, Send, AtSign } from "lucide-react";

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

        {/* Project Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-900/50">
            <TabsTrigger value="overview" onClick={() => updateSection('overview')}>
              <FileText className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="structure" onClick={() => updateSection('structure')}>
              <Users className="h-4 w-4 mr-2" />
              Structure
            </TabsTrigger>
            <TabsTrigger value="chat" onClick={() => updateSection('chat')}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Discussion
            </TabsTrigger>
            <TabsTrigger value="files" onClick={() => updateSection('files')}>
              <Clock className="h-4 w-4 mr-2" />
              Files
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
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
          </TabsContent>

          <TabsContent value="structure">
            <ProjectHierarchy 
              project={project} 
              userRole={userRole} 
              userId={user.id} 
            />
          </TabsContent>

          <TabsContent value="chat">
            <div className="space-y-6">
              <Card className="bg-gray-900/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Team Discussion
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-300">
                      Collaborate with your team using real-time messaging. Share updates, ask questions, and coordinate work.
                    </p>
                    
                    {/* Mock conversation */}
                    <div className="space-y-4 bg-gray-800/50 rounded-lg p-4 border border-gray-700 max-h-80 overflow-y-auto">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          JD
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-medium">John Doe</span>
                            <span className="text-gray-400 text-xs">2 hours ago</span>
                          </div>
                          <p className="text-gray-300 text-sm">Hey team, I've uploaded the initial concept art for sequence 01. Looking forward to your feedback!</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          SM
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-medium">Sarah Miller</span>
                            <span className="text-gray-400 text-xs">1 hour ago</span>
                          </div>
                          <p className="text-gray-300 text-sm">Great work @john! The lighting direction looks perfect for the mood we're going for.</p>
                        </div>
                      </div>
                    </div>

                    {/* Chat input */}
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Type your message..."
                        className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                      />
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <h4 className="text-white font-medium mb-2">Quick Actions</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm" className="justify-start">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Send Update
                        </Button>
                        <Button variant="outline" size="sm" className="justify-start">
                          <AtSign className="h-4 w-4 mr-2" />
                          @Mention Team
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="files">
            <div className="space-y-6">
              <Card className="bg-gray-900/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Project Files & Assets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                        <h4 className="text-white font-medium mb-2">Deliverables</h4>
                        <p className="text-gray-400 text-sm mb-3">Final renders, compositions, and approved assets</p>
                        <Button variant="outline" size="sm" className="w-full">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Files
                        </Button>
                      </div>
                      
                      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                        <h4 className="text-white font-medium mb-2">Work in Progress</h4>
                        <p className="text-gray-400 text-sm mb-3">Draft versions, previews, and work files</p>
                        <Button variant="outline" size="sm" className="w-full">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Files
                        </Button>
                      </div>

                      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                        <h4 className="text-white font-medium mb-2">References</h4>
                        <p className="text-gray-400 text-sm mb-3">Concept art, references, and source materials</p>
                        <Button variant="outline" size="sm" className="w-full">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Files
                        </Button>
                      </div>
                    </div>

                    <div className="border-t border-gray-700 pt-4">
                      <h4 className="text-white font-medium mb-3">Recent Files</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg border border-gray-700">
                          <div className="flex items-center gap-3">
                            <File className="h-5 w-5 text-blue-400" />
                            <div>
                              <p className="text-white text-sm">project_v1.blend</p>
                              <p className="text-gray-400 text-xs">Uploaded 2 hours ago • 24.5 MB</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg border border-gray-700">
                          <div className="flex items-center gap-3">
                            <File className="h-5 w-5 text-green-400" />
                            <div>
                              <p className="text-white text-sm">render_test.mp4</p>
                              <p className="text-gray-400 text-xs">Uploaded 1 day ago • 156.2 MB</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg border border-gray-700">
                          <div className="flex items-center gap-3">
                            <File className="h-5 w-5 text-purple-400" />
                            <div>
                              <p className="text-white text-sm">concept_art_seq01.jpg</p>
                              <p className="text-gray-400 text-xs">Uploaded 3 days ago • 8.7 MB</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* File upload dropzone */}
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-gray-500 transition-colors">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-white font-medium mb-2">Drop files here to upload</h4>
                      <p className="text-gray-400 text-sm mb-4">or click to browse files</p>
                      <Button variant="outline" size="sm">
                        Choose Files
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Real-time Chat */}
      <ProjectChat projectId={id || ''} userId={user.id} />
    </div>
  );
};

export default ProjectDetail;
