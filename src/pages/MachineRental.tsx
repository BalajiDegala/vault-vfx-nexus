
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardNavbar from '@/components/dashboard/DashboardNavbar';
import LocalMachineConnection from '@/components/vm/LocalMachineConnection';
import ProducerMachineInterface from '@/components/vm/ProducerMachineInterface';
import StudioMachineInterface from '@/components/vm/StudioMachineInterface';
import ArtistMachineInterface from '@/components/vm/ArtistMachineInterface';
import { useMachineDiscovery } from '@/hooks/useMachineDiscovery';
import { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

const MachineRental = () => {
  const { fetchRegisteredMachines, fetchMachinePools } = useMachineDiscovery();
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<AppRole | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const navigate = useNavigate();

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

  const handleRefresh = async () => {
    await Promise.all([
      fetchRegisteredMachines(),
      fetchMachinePools()
    ]);
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
            <h1 className="text-3xl font-bold">VFX Cloud Platform</h1>
            <p className="text-gray-400 mt-1">
              {userRole === 'producer' || userRole === 'admin' ? 'Manage machine assignments for shows and studios' :
               userRole === 'studio' ? 'Assign machines to artists for specific tasks' :
               'Access your assigned machines for show work'}
            </p>
          </div>
          <div className="flex gap-4">
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <Tabs defaultValue="management" className="space-y-6">
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger value="management" className="data-[state=active]:bg-gray-700">
              {userRole === 'artist' ? 'My Assigned Machines' : 
               userRole === 'studio' ? 'Studio Machine Management' :
               'Platform Management'}
            </TabsTrigger>
            <TabsTrigger value="local" className="data-[state=active]:bg-gray-700">
              Local Connection
            </TabsTrigger>
          </TabsList>

          <TabsContent value="management">
            {renderRoleBasedContent()}
          </TabsContent>

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
