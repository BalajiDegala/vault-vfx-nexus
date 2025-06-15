
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RefreshCw, Plus, HardDrive } from 'lucide-react';
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import DashboardNavbar from '@/components/dashboard/DashboardNavbar';
import StorageAllocationCard from '@/components/storage/StorageAllocationCard';
import StoragePlanCard from '@/components/storage/StoragePlanCard';
import { useStorageManagement } from '@/hooks/useStorageManagement';
import { useToast } from '@/hooks/use-toast';
import { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

const StorageManagement = () => {
  const { allocations, plans, loading, fetchAllocations, fetchPlans, createAllocation, terminateAllocation } = useStorageManagement();
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [allocationName, setAllocationName] = useState('');
  const [storageSize, setStorageSize] = useState(100);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
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

  useEffect(() => {
    if (user) {
      fetchAllocations();
      fetchPlans();
    }
  }, [user]);

  const handleCreateAllocation = async () => {
    if (!selectedPlan) {
      toast({
        title: "Error",
        description: "Please select a storage plan",
        variant: "destructive",
      });
      return;
    }

    if (!allocationName.trim()) {
      toast({
        title: "Error",
        description: "Please enter an allocation name",
        variant: "destructive",
      });
      return;
    }

    try {
      await createAllocation(selectedPlan, allocationName, storageSize);
      setIsCreateDialogOpen(false);
      setAllocationName('');
      setSelectedPlan('');
      setStorageSize(100);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleTerminateAllocation = async (allocationId: string) => {
    if (window.confirm('Are you sure you want to terminate this storage allocation? This action cannot be undone and all data will be permanently deleted.')) {
      await terminateAllocation(allocationId);
    }
  };

  const selectedPlanDetails = plans.find(plan => plan.name === selectedPlan);

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

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <DashboardNavbar user={user} userRole={userRole} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <HardDrive className="h-8 w-8 text-blue-400" />
            <h1 className="text-3xl font-bold">Storage Management</h1>
          </div>
          <div className="flex gap-4">
            <Button onClick={() => { fetchAllocations(); fetchPlans(); }} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Storage
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-800 border-gray-700 max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-white">Create Storage Allocation</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="allocation-name" className="text-gray-300">Allocation Name</Label>
                    <Input
                      id="allocation-name"
                      value={allocationName}
                      onChange={(e) => setAllocationName(e.target.value)}
                      placeholder="Enter allocation name"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-gray-300">Select Storage Plan</Label>
                    <div className="grid gap-3 mt-2 max-h-60 overflow-y-auto">
                      {plans.map((plan) => (
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
                                {plan.storage_type.toUpperCase()} - {plan.min_size_gb} to {plan.max_size_gb} GB
                              </p>
                            </div>
                            <span className="text-yellow-400 font-semibold">
                              {plan.monthly_rate_per_gb} V3C/GB/month
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedPlanDetails && (
                    <div>
                      <Label htmlFor="storage-size" className="text-gray-300">
                        Storage Size (GB) - Range: {selectedPlanDetails.min_size_gb} to {selectedPlanDetails.max_size_gb} GB
                      </Label>
                      <Input
                        id="storage-size"
                        type="number"
                        value={storageSize}
                        onChange={(e) => setStorageSize(parseInt(e.target.value) || 100)}
                        min={selectedPlanDetails.min_size_gb}
                        max={selectedPlanDetails.max_size_gb}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                      <p className="text-sm text-gray-400 mt-1">
                        Monthly cost: {(storageSize * selectedPlanDetails.monthly_rate_per_gb).toFixed(2)} V3C
                      </p>
                    </div>
                  )}

                  <Button onClick={handleCreateAllocation} className="w-full">
                    Create Storage Allocation
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="allocations" className="space-y-6">
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger value="allocations" className="data-[state=active]:bg-gray-700">
              My Storage ({allocations.length})
            </TabsTrigger>
            <TabsTrigger value="plans" className="data-[state=active]:bg-gray-700">
              Available Plans
            </TabsTrigger>
          </TabsList>

          <TabsContent value="allocations">
            {loading ? (
              <div className="text-center py-8">
                <div className="text-gray-400">Loading storage allocations...</div>
              </div>
            ) : allocations.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">No storage allocations found</div>
                <p className="text-sm text-gray-500 mb-6">
                  Create your first storage allocation to get started with cloud storage
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Storage
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allocations.map((allocation) => (
                  <StorageAllocationCard
                    key={allocation.id}
                    allocation={allocation}
                    onTerminate={handleTerminateAllocation}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="plans">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <StoragePlanCard
                  key={plan.id}
                  plan={plan}
                  onSelect={(planName) => {
                    setSelectedPlan(planName);
                    setIsCreateDialogOpen(true);
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

export default StorageManagement;
