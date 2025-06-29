
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  Monitor, 
  Users, 
  UserPlus, 
  Activity, 
  Clock,
  CheckCircle,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { useMachineDiscovery } from '@/hooks/useMachineDiscovery';

interface StudioAssignment {
  id: string;
  machine_id: string;
  artist_id: string;
  artist_name: string;
  task_id?: string;
  assigned_at: string;
  estimated_hours?: number;
  actual_hours: number;
  status: 'active' | 'completed' | 'paused';
}

const StudioMachineInterface: React.FC = () => {
  const { discoveredMachines } = useMachineDiscovery();
  const [studioAssignments, setStudioAssignments] = useState<StudioAssignment[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<string>('');
  const [selectedArtist, setSelectedArtist] = useState<string>('');
  const [artistName, setArtistName] = useState<string>('');
  const [taskId, setTaskId] = useState<string>('');
  const [estimatedHours, setEstimatedHours] = useState<string>('');
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  // Mock data - replace with actual data from your system
  const availableArtists = [
    { id: 'artist1', name: 'John Doe', specialization: 'Modeling' },
    { id: 'artist2', name: 'Jane Smith', specialization: 'Animation' },
    { id: 'artist3', name: 'Mike Johnson', specialization: 'Rendering' },
  ];

  const studioMachines = discoveredMachines.filter(machine => 
    machine.assigned_to === 'current_studio_id' // Replace with actual studio ID
  );

  const handleAssignToArtist = async () => {
    if (!selectedMachine || !selectedArtist || !artistName) return;

    const newAssignment: StudioAssignment = {
      id: crypto.randomUUID(),
      machine_id: selectedMachine,
      artist_id: selectedArtist,
      artist_name: artistName,
      task_id: taskId || undefined,
      assigned_at: new Date().toISOString(),
      estimated_hours: estimatedHours ? parseInt(estimatedHours) : undefined,
      actual_hours: 0,
      status: 'active',
    };

    setStudioAssignments([...studioAssignments, newAssignment]);
    setIsAssignDialogOpen(false);
    
    // Reset form
    setSelectedMachine('');
    setSelectedArtist('');
    setArtistName('');
    setTaskId('');
    setEstimatedHours('');
  };

  const getAssignmentStats = () => {
    const totalAssignments = studioAssignments.length;
    const activeAssignments = studioAssignments.filter(a => a.status === 'active').length;
    const completedAssignments = studioAssignments.filter(a => a.status === 'completed').length;
    const totalHours = studioAssignments.reduce((sum, a) => sum + a.actual_hours, 0);
    
    return { totalAssignments, activeAssignments, completedAssignments, totalHours };
  };

  const stats = getAssignmentStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Studio Machine Management</h2>
          <p className="text-gray-400">Manage artist assignments and monitor progress</p>
        </div>
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Assign to Artist
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Assign Machine to Artist</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-gray-300">Select Machine</Label>
                <Select value={selectedMachine} onValueChange={setSelectedMachine}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Choose a machine" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    {studioMachines
                      .filter(m => m.status === 'online')
                      .map((machine) => (
                        <SelectItem key={machine.ip_address} value={machine.ip_address}>
                          {machine.name} ({machine.ip_address})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-gray-300">Select Artist</Label>
                <Select value={selectedArtist} onValueChange={(value) => {
                  setSelectedArtist(value);
                  const artist = availableArtists.find(a => a.id === value);
                  if (artist) setArtistName(artist.name);
                }}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Choose an artist" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    {availableArtists.map((artist) => (
                      <SelectItem key={artist.id} value={artist.id}>
                        {artist.name} - {artist.specialization}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-gray-300">Task ID (Optional)</Label>
                <Input
                  value={taskId}
                  onChange={(e) => setTaskId(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="Link to specific task"
                />
              </div>

              <div>
                <Label className="text-gray-300">Estimated Hours</Label>
                <Input
                  type="number"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="Expected work duration"
                />
              </div>

              <Button onClick={handleAssignToArtist} className="w-full">
                Assign Machine
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Monitor className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">Available Machines</p>
                <p className="text-2xl font-bold text-white">{studioMachines.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-sm text-gray-400">Active Artists</p>
                <p className="text-2xl font-bold text-white">{stats.activeAssignments}</p>
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
                <p className="text-2xl font-bold text-white">{stats.completedAssignments}</p>
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
                <p className="text-2xl font-bold text-white">{stats.totalHours}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="machines" className="space-y-6">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="machines" className="data-[state=active]:bg-gray-700">
            Studio Machines ({studioMachines.length})
          </TabsTrigger>
          <TabsTrigger value="assignments" className="data-[state=active]:bg-gray-700">
            Artist Assignments ({studioAssignments.length})
          </TabsTrigger>
          <TabsTrigger value="progress" className="data-[state=active]:bg-gray-700">
            Progress Tracking
          </TabsTrigger>
        </TabsList>

        <TabsContent value="machines" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {studioMachines.map((machine) => {
              const assignment = studioAssignments.find(a => 
                a.machine_id === machine.ip_address && a.status === 'active'
              );
              
              return (
                <Card key={machine.ip_address} className="bg-gray-800 border-gray-700">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-white">{machine.name}</CardTitle>
                      <Badge className={
                        machine.status === 'online' ? 'bg-green-500' :
                        machine.status === 'busy' ? 'bg-yellow-500' :
                        'bg-gray-500'
                      }>
                        {machine.status}
                      </Badge>
                    </div>
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

                    {assignment && (
                      <div className="p-2 bg-blue-900/20 border border-blue-700 rounded">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-400" />
                          <span className="text-blue-300 text-sm">
                            Assigned to: {assignment.artist_name}
                          </span>
                        </div>
                        {assignment.task_id && (
                          <p className="text-xs text-blue-400 mt-1">
                            Task: {assignment.task_id}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Activity className="h-4 w-4 mr-1" />
                        Monitor
                      </Button>
                      {!assignment && (
                        <Button 
                          size="sm" 
                          onClick={() => {
                            setSelectedMachine(machine.ip_address);
                            setIsAssignDialogOpen(true);
                          }}
                        >
                          Assign
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <div className="grid gap-4">
            {studioAssignments.map((assignment) => {
              const machine = studioMachines.find(m => m.ip_address === assignment.machine_id);
              const progressPercent = assignment.estimated_hours 
                ? Math.min((assignment.actual_hours / assignment.estimated_hours) * 100, 100)
                : 0;
              
              return (
                <Card key={assignment.id} className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Monitor className="h-5 w-5 text-blue-400" />
                        <div>
                          <h3 className="text-white font-medium">
                            {machine?.name || 'Unknown Machine'}
                          </h3>
                          <p className="text-sm text-gray-400">
                            Artist: {assignment.artist_name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={
                          assignment.status === 'active' ? 'bg-green-500' :
                          assignment.status === 'completed' ? 'bg-blue-500' :
                          'bg-yellow-500'
                        }>
                          {assignment.status}
                        </Badge>
                      </div>
                    </div>
                    
                    {assignment.task_id && (
                      <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                        <ExternalLink className="h-4 w-4" />
                        <span>Task: {assignment.task_id}</span>
                      </div>
                    )}

                    {assignment.estimated_hours && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Progress</span>
                          <span className="text-white">
                            {assignment.actual_hours}h / {assignment.estimated_hours}h
                          </span>
                        </div>
                        <Progress value={progressPercent} className="h-2" />
                      </div>
                    )}

                    <div className="flex justify-between items-center mt-3">
                      <div className="text-sm text-gray-400">
                        Started: {new Date(assignment.assigned_at).toLocaleDateString()}
                      </div>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {studioAssignments.length === 0 && (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-gray-400 text-lg mb-2">No Artist Assignments</h3>
                  <p className="text-gray-500">Assign machines to artists to track their progress here.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-white text-lg mb-2">Progress Tracking Dashboard</h3>
            <p className="text-gray-400">
              Real-time progress updates and task completion tracking will be displayed here.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudioMachineInterface;
