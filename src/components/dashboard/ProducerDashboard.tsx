
import { User } from "@supabase/supabase-js";
import { useTheme } from "@/hooks/useTheme";
import DashboardNavbar from "./DashboardNavbar";
import DynamicDashboard from "./DynamicDashboard";

interface ProducerDashboardProps {
  user: User;
}

const ProducerDashboard = ({ user }: ProducerDashboardProps) => {
  const { getThemeColors } = useTheme('producer');
  const themeColors = getThemeColors('producer');

  return (
    <div className={`min-h-screen bg-gradient-to-br ${themeColors.background}`}>
      <DashboardNavbar user={user} userRole="producer" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold bg-gradient-to-r ${themeColors.primary} bg-clip-text text-transparent mb-2`}>
            Producer's Executive Suite
          </h1>
          <p className="theme-text-muted">Oversee high-level productions with golden standard project management.</p>
        </div>

        <DynamicDashboard user={user} userRole="producer" />
      </div>
    </div>
  );
};

export default ProducerDashboard;
