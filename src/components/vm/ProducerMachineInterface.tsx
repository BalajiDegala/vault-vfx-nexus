
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Monitor, 
  Users, 
  Settings, 
  BarChart3, 
  DollarSign,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useMachineDiscovery } from '@/hooks/useMachineDiscovery';
import { RoleBasedUser } from '@/hooks/useRoleBasedUserSearch';
import UserSearchDropdown from './UserSearchDropdown';
import MachinePoolManagement from './MachinePoolManagement';

interface MachineAssignment {
  id: string;
  machine_id: string;
  assigned_to: RoleBasedUser;
  assigned_by: string;
  assignment_type: 'studio' | 'artist';
  duration_hours?: number;
  cost_per_hour: number;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
}

const ProducerMachineInterface: React.FC = () => {
  const { discoveredMachines, machinePools, assignMachine } = useMachineDiscovery();
  const [assignments, setAssignments] = useState<MachineAssignment[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<string>('');
  const [assigneeType, setAssigneeType] = useState<'studio' | 'artist'>('studio');
  const [selectedUser, setSelectedUser] = useState<RoleBasedUser | null>(null);
  const [durationHours, setDurationHours] = useState<string>('');
  const [costPerHour, setCostPerHour] = useState<string>('');
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  const handleAssignMachine = async () => {
    if (!selectedMachine || !selectedUser || !costPerHour) return;

    try {
      // Call the real API to assign the machine
      await assignMachine(selectedMachine, selectedUser.id, 'current_user_id');

      const newAssignment: MachineAssignment = {
        id: crypto.randomUUID(),
        machine_id: selectedMachine,
        assigned_to: selectedUser,
        assigned_by: 'current_user_id', // Replace with actual user ID
        assignment_type: assigneeType,
        duration_hours: durationHours ? parseInt(durationHours) : undefined,
        cost_per_hour: parseFloat(costPerHour),
        status: 'active',
        created_at: new Date().toISOString(),
      };

      setAssignments([...assignments, newAssignment]);
      setIsAssignDialogOpen(false);
      
      // Reset form
      setSelectedMachine('');
      setSelectedUser(null);
      setDurationHours('');
      setCostPerHour('');
    } catch (error) {
      console.error('Failed to assign machine:', error);
    }
  };

  const getUtilizationStats = () => {
    const totalMachines = discoveredMachines.length;
    const onlineMachines = discoveredMachines.filter(m => m.status === 'online').length;
    const busyMachines = discoveredMachines.filter(m => m.status === 'busy').length;
    const assignedMachines = discoveredMachines.filter(m => m.assigned_to).length;
    
    return { totalMachines, onlineMachines, busyMachines, assignedMachines };
  };

  const stats = getUtilizationStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Producer Machine Control Center</h2>
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Users className="h-4 w-4 mr-2" />
              Assign Machine
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Assign Machine to Studio/Artist</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-gray-300">Select Machine</Label>
                <Select value={selectedMachine} onValueChange={setSelectedMachine}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Choose a machine" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    {discoveredMachines
                      .filter(m => m.status === 'online' && !m.assigned_to)
                      .map((machine) => (
                        <SelectItem key={machine.ip_address} value={machine.ip_address}>
                          {machine.name} ({machine.ip_address})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-gray-300">Assignment Type</Label>
                <Select value={assigneeType} onValueChange={(value: 'studio' | 'artist') => {
                  setAssigneeType(value);
                  setSelectedUser(null); // Reset user selection when type changes
                }}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="studio">Studio</SelectItem>
                    <SelectItem value="artist">Individual Artist</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-gray-300">
                  {assigneeType === 'studio' ? 'Select Studio' : 'Select Artist'}
                </Label>
                <UserSearchDropdown
                  placeholder={`Search ${assigneeType}s...`}
                  targetRoles={assigneeType === 'studio' ? ['studio'] : ['artist']}
                  selectedUser={selectedUser}
                  onUserSelect={setSelectedUser}
                />
              </div>

              <div>
                <Label className="text-gray-300">Duration (hours, optional)</Label>
                <Input
                  type="number"
                  value={durationHours}
                  onChange={(e) => setDurationHours(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="Leave empty for unlimited"
                />
              </div>

              <div>
                <Label className="text-gray-300">Cost per Hour (V3C)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={costPerHour}
                  onChange={(e) => setCostPerHour(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="0.00"
                />
              </div>

              <Button 
                onClick={handleAssignMachine} 
                className="w-full"
                disabled={!selectedMachine || !selectedUser || !costPerHour}
              >
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
                <p className="text-sm text-gray-400">Total Machines</p>
                <p className="text-2xl font-bold text-white">{stats.totalMachines}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-sm text-gray-400">Online</p>
                <p className="text-2xl font-bold text-white">{stats.onlineMachines}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-yellow-400" />
              <div>
                <p className="text-sm text-gray-400">In Use</p>
                <p className="text-2xl font-bold text-white">{stats.busyMachines}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-400" />
              <div>
                <p className="text-sm text-gray-400">Assigned</p>
                <p className="text-2xl font-bold text-white">{stats.assignedMachines}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pools" className="space-y-6">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="pools" className="data-[state=active]:bg-gray-700">
            Machine Pools
          </TabsTrigger>
          <TabsTrigger value="assignments" className="data-[state=active]:bg-gray-700">
            Active Assignments ({assignments.length})
          </TabsTrigger>
          <TabsTrigger value="billing" className="data-[state=active]:bg-gray-700">
            Billing & Usage
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="data-[state=active]:bg-gray-700">
            Real-time Monitoring
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pools">
          <MachinePoolManagement />
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <div className="grid gap-4">
            {assignments.map((assignment) => {
              const machine = discoveredMachines.find(m => m.ip_address === assignment.machine_id);
              return (
                <Card key={assignment.id} className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Monitor className="h-5 w-5 text-blue-400" />
                        <div>
                          <h3 className="text-white font-medium">
                            {machine?.name || assignment.machine_id}
                          </h3>
                          <p className="text-sm text-gray-400">
                            Assigned to {assignment.assignment_type}: {assignment.assigned_to.display_name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm text-gray-400">Cost/Hour</p>
                          <p className="text-white font-medium">{assignment.cost_per_hour} V3C</p>
                        </div>
                        <Badge 
                          className={
                            assignment.status === 'active' ? 'bg-green-500' :
                            assignment.status === 'completed' ? 'bg-blue-500' :
                            'bg-gray-500'
                          }
                        >
                          {assignment.status}
                        </Badge>
                      </div>
                    </div>
                    
                    {assignment.duration_hours && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-gray-400">
                        <Clock className="h-4 w-4" />
                        <span>Duration: {assignment.duration_hours} hours</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
            
            {assignments.length === 0 && (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-gray-400 text-lg mb-2">No Active Assignments</h3>
                  <p className="text-gray-500">Assign machines to studios or artists to get started.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-400" />
                  <div>
                    <p className="text-sm text-gray-400">This Month</p>
                    <p className="text-2xl font-bold text-white">2,450 V3C</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-sm text-gray-400">Avg. Utilization</p>
                    <p className="text-2xl font-bold text-white">78%</p>
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
                    <p className="text-2xl font-bold text-white">1,247</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monitoring">
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-white text-lg mb-2">Real-time Monitoring Dashboard</h3>
            <p className="text-gray-400">Live performance metrics and system health monitoring will be displayed here.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProducerMachineInterface;
