import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RefreshCw, Plus } from 'lucide-react';
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState as useStateEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardNavbar from '@/components/dashboard/DashboardNavbar';
import VMInstanceCard from '@/components/vm/VMInstanceCard';
import VMPlanCard from '@/components/vm/VMPlanCard';
import LocalMachineConnection from '@/components/vm/LocalMachineConnection';
import ProducerMachineInterface from '@/components/vm/ProducerMachineInterface';
import StudioMachineInterface from '@/components/vm/StudioMachineInterface';
import ArtistMachineInterface from '@/components/vm/ArtistMachineInterface';
import { useVMInstances } from '@/hooks/useVMInstances';
import { useToast } from '@/hooks/use-toast';
import { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

const MachineRental = () => {
  const { vmInstances, vmPlans, loading, launchVM, terminateVM, refetch } = useVMInstances();
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [vmName, setVmName] = useState('');
  const [isLaunchDialogOpen, setIsLaunchDialogOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<AppRole | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate("/login");
          return;
        }

        setUser(session.user);

        // Get user roles
        const { data: rolesData, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id);

        if (roleError || !rolesData || rolesData.length === 0) {
          console.error("Role fetch error:", roleError);
          navigate("/login");
          return;
        }

        // Use first available role
        const roles = rolesData.map(r => r.role);
        let selectedRole: AppRole = roles[0];

        // Prioritize roles: admin > producer > studio > artist
        if (roles.includes('admin')) selectedRole = 'admin';
        else if (roles.includes('producer')) selectedRole = 'producer';
        else if (roles.includes('studio')) selectedRole = 'studio';
        else if (roles.includes('artist')) selectedRole = 'artist';

        setUserRole(selectedRole);
      } catch (error) {
        console.error("Auth check error:", error);
        navigate("/login");
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !userRole) {
    return null;
  }

  // Role-based content rendering
  const renderRoleBasedContent = () => {
    switch (userRole) {
      case 'producer':
      case 'admin':
        return <ProducerMachineInterface />;
      case 'studio':
        return <StudioMachineInterface />;
      case 'artist':
        return <ArtistMachineInterface />;
      default:
        return <div className="text-center text-gray-400">Access not configured for your role.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <DashboardNavbar user={user} userRole={userRole} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Machine Management</h1>
            <p className="text-gray-400 mt-1">
              {userRole === 'producer' || userRole === 'admin' ? 'Manage machine pools and assignments' :
               userRole === 'studio' ? 'Assign machines to artists and monitor progress' :
               'Access your assigned machines and tasks'}
            </p>
          </div>
          <div className="flex gap-4">
            <Button onClick={refetch} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            {(userRole === 'producer' || userRole === 'admin') && (
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
            )}
          </div>
        </div>

        <Tabs defaultValue="management" className="space-y-6">
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger value="management" className="data-[state=active]:bg-gray-700">
              {userRole === 'artist' ? 'My Machines' : 'Machine Management'}
            </TabsTrigger>
            {(userRole === 'producer' || userRole === 'admin') && (
              <>
                <TabsTrigger value="instances" className="data-[state=active]:bg-gray-700">
                  Cloud VMs ({vmInstances.length})
                </TabsTrigger>
                <TabsTrigger value="plans" className="data-[state=active]:bg-gray-700">
                  VM Plans
                </TabsTrigger>
              </>
            )}
            <TabsTrigger value="local" className="data-[state=active]:bg-gray-700">
              Local Machines
            </TabsTrigger>
          </TabsList>

          <TabsContent value="management">
            {renderRoleBasedContent()}
          </TabsContent>

          {(userRole === 'producer' || userRole === 'admin') && (
            <>
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
            </>
          )}

          <TabsContent value="local">
            <div className="max-w-md mx-auto">
              <LocalMachineConnection />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MachineRental;
