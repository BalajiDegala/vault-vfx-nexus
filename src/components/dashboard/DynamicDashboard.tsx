import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Briefcase, 
  Clock, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  Star,
  Plus,
  ArrowRight
} from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import DynamicProjectCard from "@/components/projects/DynamicProjectCard";
import { useNavigate } from "react-router-dom";

type Project = Database["public"]["Tables"]["projects"]["Row"];

interface DashboardStats {
  activeProjects: number;
  completedTasks: number;
  pendingTasks: number;
  teamMembers: number;
  recentActivity: Array<{
    id: string;
    type: string;
    message: string;
    timestamp: string;
  }>;
  upcomingDeadlines: Array<{
    id: string;
    title: string;
    deadline: string;
    status: string;
  }>;
}

interface DynamicDashboardProps {
  user: User;
  userRole: string;
}

const DynamicDashboard = ({ user, userRole }: DynamicDashboardProps) => {
  const [stats, setStats] = useState<DashboardStats>({
    activeProjects: 0,
    completedTasks: 0,
    pendingTasks: 0,
    teamMembers: 0,
    recentActivity: [],
    upcomingDeadlines: []
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, [user.id]);

  const fetchDashboardData = async () => {
    try {
      // Fetch projects
      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .or(`client_id.eq.${user.id},assigned_to.eq.${user.id}`)
        .order('created_at', { ascending: false });

      setProjects(projectsData || []);

      // Fetch tasks for user's projects
      const projectIds = projectsData?.map(p => p.id) || [];
      let tasksData = [];
      
      if (projectIds.length > 0) {
        const { data: tasks } = await supabase
          .from('tasks')
          .select(`
            *,
            shots!inner(
              sequence_id,
              sequences!inner(project_id)
            )
          `)
          .in('shots.sequences.project_id', projectIds);
        
        tasksData = tasks || [];
      }

      // Calculate stats - using correct status values
      const activeProjects = projectsData?.filter(p => p.status === 'open' || p.status === 'review').length || 0;
      const completedTasks = tasksData.filter(t => t.status === 'completed').length;
      const pendingTasks = tasksData.filter(t => t.status === 'todo' || t.status === 'in_progress').length;

      const { data: teamData } = await supabase
        .from('profiles')
        .select('id')
        .limit(50);

      const recentActivity = [
        {
          id: '1',
          type: 'task_completed',
          message: 'Animation task completed for Scene_01',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          type: 'project_updated',
          message: 'Project timeline updated',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          type: 'team_joined',
          message: 'New team member added to project',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
        }
      ];

      const upcomingDeadlines = projectsData?.filter(p => p.deadline).map(p => ({
        id: p.id,
        title: p.title,
        deadline: p.deadline,
        status: p.status
      })) || [];

      setStats({
        activeProjects,
        completedTasks,
        pendingTasks,
        teamMembers: teamData?.length || 12,
        recentActivity,
        upcomingDeadlines: upcomingDeadlines.slice(0, 5)
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task_completed':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'project_updated':
        return <Briefcase className="h-4 w-4 text-blue-400" />;
      case 'team_joined':
        return <Users className="h-4 w-4 text-purple-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-gray-900/50 border-gray-700">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-700 rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="bg-gray-900/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Projects</p>
                <p className="text-2xl font-bold text-blue-400">{stats.activeProjects}</p>
              </div>
              <Briefcase className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Completed Tasks</p>
                <p className="text-2xl font-bold text-green-400">{stats.completedTasks}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending Tasks</p>
                <p className="text-2xl font-bold text-orange-400">{stats.pendingTasks}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Team Members</p>
                <p className="text-2xl font-bold text-purple-400">{stats.teamMembers}</p>
              </div>
              <Users className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Star className="h-5 w-5" />
              Recent Projects
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => navigate('/projects')}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
              <Button 
                size="sm" 
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                New Project
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {projects.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.slice(0, 6).map(project => (
                <DynamicProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Briefcase className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">No projects yet</p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Project
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress Overview & Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Task Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Completed</span>
                  <span className="text-green-400">{stats.completedTasks}</span>
                </div>
                <Progress 
                  value={(stats.completedTasks / (stats.completedTasks + stats.pendingTasks || 1)) * 100} 
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">In Progress</span>
                  <span className="text-orange-400">{stats.pendingTasks}</span>
                </div>
                <Progress 
                  value={(stats.pendingTasks / (stats.completedTasks + stats.pendingTasks || 1)) * 100} 
                  className="h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentActivity.map(activity => (
                <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
                  {getActivityIcon(activity.type)}
                  <div className="flex-1">
                    <p className="text-white text-sm">{activity.message}</p>
                    <p className="text-gray-400 text-xs">{formatTimeAgo(activity.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Deadlines */}
      {stats.upcomingDeadlines.length > 0 && (
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.upcomingDeadlines.map(deadline => (
                <div key={deadline.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div>
                    <p className="text-white text-sm font-medium">{deadline.title}</p>
                    <p className="text-gray-400 text-xs">
                      {new Date(deadline.deadline).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs text-orange-400 border-orange-500/30">
                    {deadline.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DynamicDashboard;
