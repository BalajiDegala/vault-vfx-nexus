
import { User } from "@supabase/supabase-js";
import { useTheme } from "@/hooks/useTheme";
import DashboardNavbar from "./DashboardNavbar";
import DynamicDashboard from "./DynamicDashboard";
import StudioTaskSharing from "@/components/studio/StudioTaskSharing";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Share2 } from "lucide-react";

interface StudioDashboardProps {
  user: User;
}

const StudioDashboard = ({ user }: StudioDashboardProps) => {
  const { getThemeColors } = useTheme('studio');
  const themeColors = getThemeColors('studio');

  return (
    <div className={`min-h-screen bg-gradient-to-br ${themeColors.background}`}>
      <DashboardNavbar user={user} userRole="studio" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold bg-gradient-to-r ${themeColors.primary} bg-clip-text text-transparent mb-2`}>
            Studio Command Center
          </h1>
          <p className="theme-text-muted">Professional project management and talent coordination at scale.</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className={`grid w-full grid-cols-2 ${themeColors.surface} border-theme-border`}>
            <TabsTrigger value="overview" className="data-[state=active]:bg-theme-primary data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard Overview
            </TabsTrigger>
            <TabsTrigger value="task-sharing" className="data-[state=active]:bg-theme-secondary data-[state=active]:text-white">
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
