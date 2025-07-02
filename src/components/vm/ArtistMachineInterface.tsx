
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Monitor, 
  Activity, 
  Clock,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  FileText
} from 'lucide-react';
import { useMachineDiscovery } from '@/hooks/useMachineDiscovery';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

interface ArtistTask {
  id: string;
  name: string;
  description: string;
  status: string;
  machine_ip?: string;
  estimated_hours?: number;
  actual_hours: number;
  project_name: string;
  show_name: string;
}

const ArtistMachineInterface: React.FC = () => {
  const { discoveredMachines } = useMachineDiscovery();
  const [assignedTasks, setAssignedTasks] = useState<ArtistTask[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setCurrentUser(session.user.id);
      }
    };
    getCurrentUser();
  }, []);

  // Filter machines assigned to current artist
  const assignedMachines = discoveredMachines.filter(machine => 
    machine.assigned_to === currentUser
  );

  const getTaskProgress = (task: ArtistTask) => {
    if (!task.estimated_hours) return 0;
    return Math.min((task.actual_hours / task.estimated_hours) * 100, 100);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'in_progress':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'on_hold':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">My Assigned Machines & Tasks</h2>
          <p className="text-gray-400">Work on your assigned tasks using secure, isolated machines</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Monitor className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">Assigned Machines</p>
                <p className="text-2xl font-bold text-white">{assignedMachines.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-sm text-gray-400">Active Tasks</p>
                <p className="text-2xl font-bold text-white">{assignedTasks.filter(t => t.status === 'active').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-purple-400" />
              <div>
                <p className="text-sm text-gray-400">Completed Tasks</p>
                <p className="text-2xl font-bold text-white">{assignedTasks.filter(t => t.status === 'completed').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-400" />
              <div>
                <p className="text-sm text-gray-400">Total Hours</p>
                <p className="text-2xl font-bold text-white">
                  {assignedTasks.reduce((sum, task) => sum + task.actual_hours, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="machines" className="space-y-6">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="machines" className="data-[state=active]:bg-gray-700">
            My Machines ({assignedMachines.length})
          </TabsTrigger>
          <TabsTrigger value="tasks" className="data-[state=active]:bg-gray-700">
            My Tasks ({assignedTasks.length})
          </TabsTrigger>
          <TabsTrigger value="data-mounts" className="data-[state=active]:bg-gray-700">
            Show Data Access
          </TabsTrigger>
        </TabsList>

        <TabsContent value="machines" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignedMachines.map((machine) => (
              <Card key={machine.ip_address} className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-white">{machine.name}</CardTitle>
                    <Badge className={
                      machine.status === 'online' ? 'bg-green-500' :
                      machine.status === 'busy' ? 'bg-blue-500' :
                      'bg-gray-500'
                    }>
                      {machine.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400">{machine.ip_address}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-300">
                      CPU: {machine.capabilities.cpu_cores} cores
                    </div>
                    <div className="text-gray-300">
                      RAM: {machine.capabilities.total_ram_gb} GB
                    </div>
                    {machine.capabilities.gpu_model && (
                      <div className="text-gray-300 col-span-2">
                        GPU: {machine.capabilities.gpu_model}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>CPU Usage</span>
                      <span>{machine.utilization.cpu_percent}%</span>
                    </div>
                    <Progress value={machine.utilization.cpu_percent} className="h-1" />
                    
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Memory Usage</span>
                      <span>{machine.utilization.memory_percent}%</span>
                    </div>
                    <Progress value={machine.utilization.memory_percent} className="h-1" />
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm flex items-center justify-center gap-1">
                      <ExternalLink className="h-4 w-4" />
                      Connect
                    </button>
                    <button className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm flex items-center justify-center gap-1">
                      <Activity className="h-4 w-4" />
                      Monitor
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {assignedMachines.length === 0 && (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-8 text-center">
                <Monitor className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-gray-400 text-lg mb-2">No Assigned Machines</h3>
                <p className="text-gray-500">Contact your studio manager to get machine assignments for your tasks.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <div className="grid gap-4">
            {assignedTasks.map((task) => {
              const progressPercent = getTaskProgress(task);
              
              return (
                <Card key={task.id} className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-400" />
                        <div>
                          <h3 className="text-white font-medium">{task.name}</h3>
                          <p className="text-sm text-gray-400">
                            {task.show_name} - {task.project_name}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-gray-300 mb-3">{task.description}</p>
                    )}

                    {task.machine_ip && (
                      <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                        <Monitor className="h-4 w-4" />
                        <span>Machine: {task.machine_ip}</span>
                      </div>
                    )}

                    {task.estimated_hours && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Progress</span>
                          <span className="text-white">
                            {task.actual_hours}h / {task.estimated_hours}h
                          </span>
                        </div>
                        <Progress value={progressPercent} className="h-2" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
            
            {assignedTasks.length === 0 && (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-gray-400 text-lg mb-2">No Assigned Tasks</h3>
                  <p className="text-gray-500">Tasks will appear here when assigned by your studio.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="data-mounts">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-white text-lg mb-2">Secure Show Data Access</h3>
              <p className="text-gray-400">
                Show data is securely mounted on your assigned machines. All work remains isolated and secure.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ArtistMachineInterface;
