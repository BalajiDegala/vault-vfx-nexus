
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Monitor, 
  ExternalLink, 
  Clock, 
  Activity, 
  CheckCircle,
  PlayCircle,
  PauseCircle,
  Info,
  Wifi,
  HardDrive,
  Cpu,
  Zap
} from 'lucide-react';
import { useDCVConnection } from '@/hooks/useDCVConnection';
import DCVConnectionStatus from './DCVConnectionStatus';

interface ArtistMachine {
  id: string;
  name: string;
  ip_address: string;
  status: 'online' | 'offline' | 'maintenance';
  capabilities: {
    cpu_cores: number;
    total_ram_gb: number;
    gpu_model?: string;
    software_installed: string[];
  };
  assignment: {
    task_id?: string;
    task_name?: string;
    estimated_hours?: number;
    deadline?: string;
    notes?: string;
  };
  dcv_connection_url?: string;
  session_info?: {
    active: boolean;
    start_time?: string;
    duration_minutes?: number;
  };
}

const ArtistMachineInterface: React.FC = () => {
  const { connectToVM } = useDCVConnection();
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);

  // Mock data - replace with actual assigned machines from your system
  const assignedMachines: ArtistMachine[] = [
    {
      id: 'machine1',
      name: 'Workstation-Alpha-01',
      ip_address: '192.168.1.101',
      status: 'online',
      capabilities: {
        cpu_cores: 16,
        total_ram_gb: 64,
        gpu_model: 'RTX 4080',
        software_installed: ['Maya 2024', 'Houdini', 'Nuke', 'Blender']
      },
      assignment: {
        task_id: 'TASK-001',
        task_name: 'Character Animation - Hero Shot',
        estimated_hours: 24,
        deadline: '2024-02-15',
        notes: 'Focus on facial expressions and lip sync'
      },
      dcv_connection_url: 'https://192.168.1.101:8443',
      session_info: {
        active: false
      }
    },
    {
      id: 'machine2',
      name: 'Render-Node-05',
      ip_address: '192.168.1.105',
      status: 'online',
      capabilities: {
        cpu_cores: 32,
        total_ram_gb: 128,
        gpu_model: 'RTX 4090',
        software_installed: ['Arnold', 'V-Ray', 'Octane', 'Redshift']
      },
      assignment: {
        task_id: 'TASK-002',
        task_name: 'Lighting and Rendering - Environment',
        estimated_hours: 16,
        deadline: '2024-02-12'
      },
      dcv_connection_url: 'https://192.168.1.105:8443',
      session_info: {
        active: true,
        start_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        duration_minutes: 120
      }
    }
  ];

  const handleConnect = async (machine: ArtistMachine) => {
    if (!machine.dcv_connection_url) return;
    
    try {
      await connectToVM(machine.id, machine.dcv_connection_url);
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500 text-white';
      case 'offline': return 'bg-gray-500 text-white';
      case 'maintenance': return 'bg-red-500 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">My Assigned Machines</h2>
          <p className="text-gray-400">Connect to your assigned workstations and manage your tasks</p>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-400" />
          <span className="text-green-400 text-sm">
            {assignedMachines.filter(m => m.status === 'online').length} online
          </span>
        </div>
      </div>

      {/* Active Session Alert */}
      {assignedMachines.some(m => m.session_info?.active) && (
        <Alert className="bg-blue-900/20 border-blue-700">
          <Activity className="h-4 w-4" />
          <AlertDescription className="text-blue-300">
            You have an active DCV session running. Remember to save your work regularly.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {assignedMachines.map((machine) => (
          <Card key={machine.id} className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-white">{machine.name}</CardTitle>
                  <p className="text-sm text-gray-400">{machine.ip_address}</p>
                </div>
                <Badge className={getStatusColor(machine.status)}>
                  {machine.status}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Machine Specifications */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-300">
                  <Cpu className="h-4 w-4" />
                  <span>{machine.capabilities.cpu_cores} cores</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <HardDrive className="h-4 w-4" />
                  <span>{machine.capabilities.total_ram_gb} GB RAM</span>
                </div>
                {machine.capabilities.gpu_model && (
                  <div className="flex items-center gap-2 text-gray-300 col-span-2">
                    <Zap className="h-4 w-4" />
                    <span>{machine.capabilities.gpu_model}</span>
                  </div>
                )}
              </div>

              {/* Task Assignment */}
              {machine.assignment.task_id && (
                <div className="p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-white font-medium">{machine.assignment.task_name}</h4>
                      <p className="text-xs text-gray-400">Task ID: {machine.assignment.task_id}</p>
                    </div>
                    {machine.assignment.deadline && (
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Deadline</p>
                        <p className="text-sm text-yellow-400">
                          {new Date(machine.assignment.deadline).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {machine.assignment.estimated_hours && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Clock className="h-4 w-4" />
                      <span>Estimated: {machine.assignment.estimated_hours} hours</span>
                    </div>
                  )}

                  {machine.assignment.notes && (
                    <div className="mt-2 p-2 bg-gray-600 rounded text-sm">
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-300">{machine.assignment.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Session Information */}
              {machine.session_info?.active && (
                <div className="p-3 bg-green-900/20 border border-green-700 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <PlayCircle className="h-4 w-4 text-green-400" />
                    <span className="text-green-400 font-medium">Active Session</span>
                  </div>
                  <div className="text-sm text-gray-300">
                    <p>Started: {new Date(machine.session_info.start_time!).toLocaleTimeString()}</p>
                    <p>Duration: {formatDuration(machine.session_info.duration_minutes!)}</p>
                  </div>
                </div>
              )}

              {/* Software Available */}
              <div>
                <p className="text-sm text-gray-400 mb-2">Available Software:</p>
                <div className="flex flex-wrap gap-1">
                  {machine.capabilities.software_installed.map((software, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {software}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* DCV Connection */}
              <DCVConnectionStatus
                vmId={machine.id}
                vmStatus={machine.status}
                dcvUrl={machine.dcv_connection_url || null}
                onConnect={() => handleConnect(machine)}
              />

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                {machine.status === 'online' && machine.dcv_connection_url && (
                  <Button 
                    onClick={() => handleConnect(machine)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Connect to Desktop
                  </Button>
                )}
                
                {machine.session_info?.active && (
                  <Button variant="outline" size="sm">
                    <PauseCircle className="h-4 w-4 mr-1" />
                    Pause
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {assignedMachines.length === 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-12 text-center">
            <Monitor className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-gray-400 text-xl mb-2">No Machines Assigned</h3>
            <p className="text-gray-500 mb-4">
              You don't have any machines assigned to you yet. 
              Contact your studio manager to get machine access.
            </p>
            <Alert className="bg-blue-900/20 border-blue-700 text-left max-w-md mx-auto">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-blue-300">
                Once assigned, your machines will appear here with connection details and task information.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ArtistMachineInterface;
