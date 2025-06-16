
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Clock, AlertTriangle, Users } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type Task = Database["public"]["Tables"]["tasks"]["Row"];

interface TasksOverviewProps {
  tasks: Task[];
}

const TasksOverview = ({ tasks }: TasksOverviewProps) => {
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    todo: 0,
    blocked: 0,
    overdue: 0,
    completionRate: 0
  });

  useEffect(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const todo = tasks.filter(t => t.status === 'todo').length;
    const blocked = tasks.filter(t => t.status === 'blocked').length;
    const overdue = 0; // TODO: Calculate based on deadlines
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    setStats({
      total,
      completed,
      inProgress,
      todo,
      blocked,
      overdue,
      completionRate
    });
  }, [tasks]);

  const statCards = [
    {
      title: "Total Tasks",
      value: stats.total,
      icon: <Users className="h-5 w-5" />,
      color: "text-blue-400"
    },
    {
      title: "Completed",
      value: stats.completed,
      icon: <CheckCircle2 className="h-5 w-5" />,
      color: "text-green-400"
    },
    {
      title: "In Progress",
      value: stats.inProgress,
      icon: <Clock className="h-5 w-5" />,
      color: "text-yellow-400"
    },
    {
      title: "To Do",
      value: stats.todo,
      icon: <AlertTriangle className="h-5 w-5" />,
      color: "text-gray-400"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="bg-gray-900/50 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress Overview */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-400" />
            Project Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Overall Completion</span>
            <span className="text-white font-semibold">{stats.completionRate}%</span>
          </div>
          <Progress value={stats.completionRate} className="h-2" />
          
          <div className="flex flex-wrap gap-3 mt-4">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              {stats.completed} Completed
            </Badge>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              {stats.inProgress} In Progress
            </Badge>
            <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
              {stats.todo} To Do
            </Badge>
            {stats.blocked > 0 && (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                {stats.blocked} Blocked
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TasksOverview;
