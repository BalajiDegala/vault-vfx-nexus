
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RefreshCw, Plus } from 'lucide-react';
import VMInstanceCard from '@/components/vm/VMInstanceCard';
import VMPlanCard from '@/components/vm/VMPlanCard';
import { useVMInstances } from '@/hooks/useVMInstances';
import { useToast } from '@/hooks/use-toast';

const MachineRental = () => {
  const { vmInstances, vmPlans, loading, launchVM, terminateVM, refetch } = useVMInstances();
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [vmName, setVmName] = useState('');
  const [isLaunchDialogOpen, setIsLaunchDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleLaunchVM = async () => {
    if (!selectedPlan) {
      toast({
        title: "Error",
        description: "Please select a VM plan",
        variant: "destructive",
      });
      return;
    }

    try {
      await launchVM(selectedPlan, vmName || undefined);
      setIsLaunchDialogOpen(false);
      setVmName('');
      setSelectedPlan('');
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleConnectToVM = (dcvUrl: string) => {
    window.open(dcvUrl, '_blank');
  };

  const handleTerminateVM = async (vmId: string) => {
    if (window.confirm('Are you sure you want to terminate this VM? This action cannot be undone.')) {
      await terminateVM(vmId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Virtual Machine Rental</h1>
          <div className="flex gap-4">
            <Button onClick={refetch} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Dialog open={isLaunchDialogOpen} onOpenChange={setIsLaunchDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Launch VM
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-800 border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Launch New Virtual Machine</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="vm-name" className="text-gray-300">VM Name (optional)</Label>
                    <Input
                      id="vm-name"
                      value={vmName}
                      onChange={(e) => setVmName(e.target.value)}
                      placeholder="Enter custom VM name"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Select VM Plan</Label>
                    <div className="grid gap-3 mt-2 max-h-60 overflow-y-auto">
                      {vmPlans.map((plan) => (
                        <div
                          key={plan.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedPlan === plan.name
                              ? 'border-blue-500 bg-blue-500/20'
                              : 'border-gray-600 hover:border-gray-500'
                          }`}
                          onClick={() => setSelectedPlan(plan.name)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium text-white">{plan.display_name}</h4>
                              <p className="text-sm text-gray-400">
                                {plan.cpu_cores} cores, {plan.ram_gb} GB RAM, {plan.storage_gb} GB storage
                              </p>
                            </div>
                            <span className="text-yellow-400 font-semibold">
                              {plan.hourly_rate} V3C/hr
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button onClick={handleLaunchVM} className="w-full">
                    Launch Virtual Machine
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="instances" className="space-y-6">
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger value="instances" className="data-[state=active]:bg-gray-700">
              My VMs ({vmInstances.length})
            </TabsTrigger>
            <TabsTrigger value="plans" className="data-[state=active]:bg-gray-700">
              Available Plans
            </TabsTrigger>
          </TabsList>

          <TabsContent value="instances">
            {loading ? (
              <div className="text-center py-8">
                <div className="text-gray-400">Loading VM instances...</div>
              </div>
            ) : vmInstances.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">No virtual machines found</div>
                <p className="text-sm text-gray-500 mb-6">
                  Launch your first VM to get started with cloud computing
                </p>
                <Button onClick={() => setIsLaunchDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Launch Your First VM
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vmInstances.map((vm) => (
                  <VMInstanceCard
                    key={vm.id}
                    vm={vm}
                    onTerminate={handleTerminateVM}
                    onConnect={handleConnectToVM}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="plans">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vmPlans.map((plan) => (
                <VMPlanCard
                  key={plan.id}
                  plan={plan}
                  onLaunch={(planName) => {
                    setSelectedPlan(planName);
                    setIsLaunchDialogOpen(true);
                  }}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MachineRental;
