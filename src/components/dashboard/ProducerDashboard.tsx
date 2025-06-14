
import { User } from "@supabase/supabase-js";
import { useTheme } from "@/hooks/useTheme";
import DashboardNavbar from "./DashboardNavbar";
import DynamicDashboard from "./DynamicDashboard";
import V3CoinsWallet from "@/components/v3c/V3CoinsWallet";
import V3CoinsSendForm from "@/components/v3c/V3CoinsSendForm";

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
        {/* V3C Wallet Section */}
        <V3CoinsWallet userId={user.id} />
        <V3CoinsSendForm userId={user.id} />

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

