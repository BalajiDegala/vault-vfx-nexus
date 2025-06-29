
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  Plus, 
  Monitor, 
  Cpu, 
  HardDrive, 
  Zap, 
  MapPin, 
  Users,
  Activity,
  Settings,
  PlayCircle,
  PauseCircle,
  AlertTriangle
} from 'lucide-react';
import { useMachineDiscovery, type DiscoveredMachine } from '@/hooks/useMachineDiscovery';

const MachinePoolManagement: React.FC = () => {
  const {
    discoveredMachines,
    machinePools,
    isScanning,
    scanProgress,
    scanNetworkRange,
    registerMachine,
    assignMachine,
    createMachinePool,
  } = useMachineDiscovery();

  const [networkRange, setNetworkRange] = useState('192.168.1.0/24');
  const [selectedMachines, setSelectedMachines] = useState<string[]>([]);
  const [poolName, setPoolName] = useState('');
  const [poolDescription, setPoolDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isPoolDialogOpen, setIsPoolDialogOpen] = useState(false);

  const handleScanNetwork = () => {
    scanNetworkRange(networkRange);
  };

  const handleCreatePool = async () => {
    if (!poolName || selectedMachines.length === 0) return;
    
    await createMachinePool(poolName, poolDescription, selectedMachines);
    setIsPoolDialogOpen(false);
    setPoolName('');
    setPoolDescription('');
    setSelectedMachines([]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      case 'maintenance': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const filteredMachines = discoveredMachines.filter(machine =>
    machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    machine.ip_address.includes(searchTerm) ||
    machine.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Machine Pool Management</h2>
        <div className="flex gap-3">
          <Dialog open={isPoolDialogOpen} onOpenChange={setIsPoolDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Pool
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 border-gray-700 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white">Create Machine Pool</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="pool-name" className="text-gray-300">Pool Name</Label>
                  <Input
                    id="pool-name"
                    value={poolName}
                    onChange={(e) => setPoolName(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="e.g., Rendering Farm Alpha"
                  />
                </div>
                <div>
                  <Label htmlFor="pool-description" className="text-gray-300">Description</Label>
                  <Input
                    id="pool-description"
                    value={poolDescription}
                    onChange={(e) => setPoolDescription(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Description of the machine pool"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Select Machines</Label>
                  <div className="max-h-60 overflow-y-auto space-y-2 mt-2">
                    {filteredMachines.map((machine) => (
                      <div key={machine.id || machine.ip_address} className="flex items-center space-x-2 p-2 bg-gray-700 rounded">
                        <Checkbox
                          checked={selectedMachines.includes(machine.ip_address)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedMachines([...selectedMachines, machine.ip_address]);
                            } else {
                              setSelectedMachines(selectedMachines.filter(id => id !== machine.ip_address));
                            }
                          }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium">{machine.name}</span>
                            <Badge className={`${getStatusColor(machine.status)} text-white`}>
                              {machine.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-400">{machine.ip_address} • {machine.location}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <Button onClick={handleCreatePool} className="w-full">
                  Create Pool ({selectedMachines.length} machines)
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="discovery" className="space-y-6">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="discovery" className="data-[state=active]:bg-gray-700">
            Machine Discovery
          </TabsTrigger>
          <TabsTrigger value="pools" className="data-[state=active]:bg-gray-700">
            Machine Pools ({machinePools.length})
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="data-[state=active]:bg-gray-700">
            Real-time Monitoring
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discovery" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Search className="h-5 w-5" />
                Network Discovery
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="network-range" className="text-gray-300">Network Range</Label>
                  <Input
                    id="network-range"
                    value={networkRange}
                    onChange={(e) => setNetworkRange(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="192.168.1.0/24"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleScanNetwork} disabled={isScanning}>
                    {isScanning ? (
                      <>
                        <Activity className="h-4 w-4 mr-2 animate-spin" />
                        Scanning...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Scan Network
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              {isScanning && (
                <div className="space-y-2">
                  <Progress value={scanProgress} className="w-full" />
                  <p className="text-sm text-gray-400">Scanning network for DCV-enabled machines...</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search machines..."
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMachines.map((machine) => (
              <Card key={machine.id || machine.ip_address} className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-white">{machine.name}</CardTitle>
                    <Badge className={`${getStatusColor(machine.status)} text-white`}>
                      {machine.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400">{machine.hostname}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1 text-gray-300">
                      <Cpu className="h-3 w-3" />
                      <span>{machine.capabilities.cpu_cores} cores</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-300">
                      <Monitor className="h-3 w-3" />
                      <span>{machine.capabilities.total_ram_gb} GB RAM</span>
                    </div>
                    {machine.capabilities.gpu_model && (
                      <div className="flex items-center gap-1 text-gray-300 col-span-2">
                        <Zap className="h-3 w-3" />
                        <span>{machine.capabilities.gpu_model}</span>
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

                  <div className="flex items-center gap-1 text-sm text-gray-400">
                    <MapPin className="h-3 w-3" />
                    <span>{machine.location}</span>
                  </div>

                  {machine.assigned_to && (
                    <Alert className="bg-blue-900/20 border-blue-700">
                      <Users className="h-4 w-4" />
                      <AlertDescription className="text-blue-300 text-sm">
                        Assigned to user: {machine.assigned_to}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => registerMachine(machine)}
                      className="flex-1"
                    >
                      Register
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pools" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {machinePools.map((pool) => (
              <Card key={pool.id} className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">{pool.name}</CardTitle>
                  <p className="text-sm text-gray-400">{pool.description}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Machines</span>
                    <Badge variant="secondary">{pool.machines.length}</Badge>
                  </div>
                  
                  <div className="space-y-1">
                    {pool.machines.slice(0, 3).map((machine, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">{machine.name}</span>
                        <Badge className={`${getStatusColor(machine.status)} text-white text-xs`}>
                          {machine.status}
                        </Badge>
                      </div>
                    ))}
                    {pool.machines.length > 3 && (
                      <p className="text-xs text-gray-500">+{pool.machines.length - 3} more</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      Manage
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Activity className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Alert className="bg-yellow-900/20 border-yellow-700">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-yellow-300">
              Real-time monitoring dashboard - showing live machine utilization and performance metrics.
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-green-400" />
                  <div>
                    <p className="text-sm text-gray-400">Online Machines</p>
                    <p className="text-2xl font-bold text-white">
                      {discoveredMachines.filter(m => m.status === 'online').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-yellow-400" />
                  <div>
                    <p className="text-sm text-gray-400">Busy Machines</p>
                    <p className="text-2xl font-bold text-white">
                      {discoveredMachines.filter(m => m.status === 'busy').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-sm text-gray-400">Assigned</p>
                    <p className="text-2xl font-bold text-white">
                      {discoveredMachines.filter(m => m.assigned_to).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-400" />
                  <div>
                    <p className="text-sm text-gray-400">GPU Machines</p>
                    <p className="text-2xl font-bold text-white">
                      {discoveredMachines.filter(m => m.capabilities.gpu_model).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MachinePoolManagement;
