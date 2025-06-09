
import { User } from "@supabase/supabase-js";
import DashboardNavbar from "./DashboardNavbar";
import DynamicDashboard from "./DynamicDashboard";
import StudioTaskSharing from "@/components/studio/StudioTaskSharing";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Share2 } from "lucide-react";

interface StudioDashboardProps {
  user: User;
}

const StudioDashboard = ({ user }: StudioDashboardProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      <DashboardNavbar user={user} userRole="studio" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Studio Dashboard
          </h1>
          <p className="text-gray-400">Manage your studio operations, talent network, and task sharing with real-time insights.</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-gray-900/50">
            <TabsTrigger value="overview">
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard Overview
            </TabsTrigger>
            <TabsTrigger value="task-sharing">
              <Share2 className="h-4 w-4 mr-2" />
              Task Sharing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <DynamicDashboard user={user} userRole="studio" />
          </TabsContent>

          <TabsContent value="task-sharing">
            <StudioTaskSharing userId={user.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudioDashboard;
