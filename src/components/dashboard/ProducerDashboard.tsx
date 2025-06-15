
import { User } from "@supabase/supabase-js";
import { useTheme } from "@/hooks/useTheme";
import DashboardNavbar from "./DashboardNavbar";
import DynamicDashboard from "./DynamicDashboard";
import V3CoinsWallet from "@/components/v3c/V3CoinsWallet";
import V3CoinsSendForm from "@/components/v3c/V3CoinsSendForm";
import { Briefcase } from "lucide-react";

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

        {/* Wallet Section */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="luxury-card p-6 rounded-xl border border-amber-500/20 hover:border-amber-400/40 transition-all duration-300">
            <V3CoinsWallet userId={user.id} />
          </div>
          <div className="luxury-card p-6 rounded-xl border border-amber-500/20 hover:border-amber-400/40 transition-all duration-300">
            <V3CoinsSendForm userId={user.id} />
          </div>
        </div>

        {/* Executive Suite Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/30">
              <Briefcase className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Producer Dashboard</h1>
              <p className="theme-text-muted">Executive production management suite</p>
            </div>
          </div>
        </div>

        <DynamicDashboard user={user} userRole="producer" />
      </div>
    </div>
  );
};

export default ProducerDashboard;
