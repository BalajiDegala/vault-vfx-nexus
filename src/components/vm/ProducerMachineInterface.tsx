
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
  Shield,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useMachineDiscovery } from '@/hooks/useMachineDiscovery';
import { RoleBasedUser } from '@/hooks/useRoleBasedUserSearch';
import UserSearchDropdown from './UserSearchDropdown';
import MachinePoolManagement from './MachinePoolManagement';
import { useToast } from '@/hooks/use-toast';

interface ShowAssignment {
  id: string;
  machine_id: string;
  show_name: string;
  studio: RoleBasedUser;
  assigned_by: string;
  assignment_type: 'show_studio';
  data_mount_path: string;
  security_level: 'high' | 'medium' | 'low';
  status: 'active' | 'completed' | 'suspended';
  created_at: string;
}

const ProducerMachineInterface: React.FC = () => {
  const { discoveredMachines, assignMachine } = useMachineDiscovery();
  const [showAssignments, setShowAssignments] = useState<ShowAssignment[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<string>('');
  const [selectedStudio, setSelectedStudio] = useState<RoleBasedUser | null>(null);
  const [showName, setShowName] = useState<string>('');
  const [dataMountPath, setDataMountPath] = useState<string>('');
  const [securityLevel, setSecurityLevel] = useState<'high' | 'medium' | 'low'>('high');
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleAssignMachineToShow = async () => {
    if (!selectedMachine || !selectedStudio || !showName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      // Call the assign machine API
      await assignMachine(selectedMachine, selectedStudio.id, 'current_user_id');

      const newAssignment: ShowAssignment = {
        id: crypto.randomUUID(),
        machine_id: selectedMachine,
        show_name: showName,
        studio: selectedStudio,
        assigned_by: 'current_user_id', // Replace with actual user ID
        assignment_type: 'show_studio',
        data_mount_path: dataMountPath || `/shows/${showName.toLowerCase().replace(/\s+/g, '_')}`,
        security_level: securityLevel,
        status: 'active',
        created_at: new Date().toISOString(),
      };

      setShowAssignments([...showAssignments, newAssignment]);
      setIsAssignDialogOpen(false);
      
      // Reset form
      setSelectedMachine('');
      setSelectedStudio(null);
      setShowName('');
      setDataMountPath('');
      setSecurityLevel('high');

      toast({
        title: "Show Assignment Created",
        description: `Machine assigned to ${selectedStudio.display_name} for show "${showName}"`,
      });
    } catch (error) {
      console.error('Failed to assign machine to show:', error);
      toast({
        title: "Assignment Failed",
        description: "Failed to assign machine. Please check the logs and try again.",
        variant: "destructive",
      });
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
        <div>
          <h2 className="text-2xl font-bold text-white">VFX Cloud Platform Management</h2>
          <p className="text-gray-400">Assign secure machines to studios for show production</p>
        </div>
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Shield className="h-4 w-4 mr-2" />
              Assign Machine to Show
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 border-gray-700 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Assign Machine to Show & Studio</DialogTitle>
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
                          {machine.name} ({machine.ip_address}) - {machine.capabilities.cpu_cores}c/{machine.capabilities.total_ram_gb}GB
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-gray-300">Show Name *</Label>
                <Input
                  value={showName}
                  onChange={(e) => setShowName(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="Enter show/project name"
                />
              </div>

              <div>
                <Label className="text-gray-300">Select Studio *</Label>
                <UserSearchDropdown
                  placeholder="Search studios..."
                  targetRoles={['studio']}
                  selectedUser={selectedStudio}
                  onUserSelect={setSelectedStudio}
                />
              </div>

              <div>
                <Label className="text-gray-300">Data Mount Path</Label>
                <Input
                  value={dataMountPath}
                  onChange={(e) => setDataMountPath(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="/shows/project_name (auto-generated if empty)"
                />
              </div>

              <div>
                <Label className="text-gray-300">Security Level</Label>
                <Select value={securityLevel} onValueChange={(value: 'high' | 'medium' | 'low') => setSecurityLevel(value)}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="high">High - Isolated network, encrypted storage</SelectItem>
                    <SelectItem value="medium">Medium - Standard isolation</SelectItem>
                    <SelectItem value="low">Low - Basic security</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleAssignMachineToShow} 
                className="w-full"
                disabled={!selectedMachine || !selectedStudio || !showName}
              >
                Create Show Assignment
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
                <p className="text-sm text-gray-400">In Production</p>
                <p className="text-2xl font-bold text-white">{stats.busyMachines}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-400" />
              <div>
                <p className="text-sm text-gray-400">Show Assignments</p>
                <p className="text-2xl font-bold text-white">{showAssignments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="shows" className="space-y-6">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="shows" className="data-[state=active]:bg-gray-700">
            Show Assignments ({showAssignments.length})
          </TabsTrigger>
          <TabsTrigger value="pools" className="data-[state=active]:bg-gray-700">
            Machine Pools
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="data-[state=active]:bg-gray-700">
            Platform Monitoring
          </TabsTrigger>
        </TabsList>

        <TabsContent value="shows" className="space-y-4">
          <div className="grid gap-4">
            {showAssignments.map((assignment) => {
              const machine = discoveredMachines.find(m => m.ip_address === assignment.machine_id);
              return (
                <Card key={assignment.id} className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-purple-400" />
                        <div>
                          <h3 className="text-white font-medium">
                            Show: {assignment.show_name}
                          </h3>
                          <p className="text-sm text-gray-400">
                            Studio: {assignment.studio.display_name} | Machine: {machine?.name || assignment.machine_id}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={`${
                          assignment.security_level === 'high' ? 'bg-red-500' :
                          assignment.security_level === 'medium' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}>
                          {assignment.security_level.toUpperCase()} SEC
                        </Badge>
                        <Badge className={
                          assignment.status === 'active' ? 'bg-green-500' :
                          assignment.status === 'completed' ? 'bg-blue-500' :
                          'bg-gray-500'
                        }>
                          {assignment.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Settings className="h-4 w-4" />
                        <span>Mount: {assignment.data_mount_path}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>Created: {new Date(assignment.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {showAssignments.length === 0 && (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-8 text-center">
                  <Shield className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-gray-400 text-lg mb-2">No Show Assignments</h3>
                  <p className="text-gray-500">Create show assignments to allocate machines to studios for secure production work.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="pools">
          <MachinePoolManagement />
        </TabsContent>

        <TabsContent value="monitoring">
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-white text-lg mb-2">Platform Monitoring Dashboard</h3>
            <p className="text-gray-400">Real-time monitoring of machine performance, security, and show production metrics.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProducerMachineInterface;
