
import { User } from "@supabase/supabase-js";
import { useTheme } from "@/hooks/useTheme";
import DashboardNavbar from "./DashboardNavbar";
import DynamicDashboard from "./DynamicDashboard";
import V3CoinsWallet from "@/components/v3c/V3CoinsWallet";
import V3CoinsSendForm from "@/components/v3c/V3CoinsSendForm";
import { Crown } from "lucide-react";

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

        {/* Premium Wallet Section */}
        <div className="grid lg:grid-cols-2 gap-6 mb-10">
          <div className="luxury-card p-6 flex flex-col items-center rounded-2xl shadow-lg border border-yellow-500/30 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none z-0" style={{ background: "radial-gradient(circle at 70% 30%, rgba(255,215,64,0.08), transparent 70%)" }} />
            <div className="z-10 w-full">
              <V3CoinsWallet userId={user.id} />
            </div>
          </div>
          <div className="luxury-card p-6 flex flex-col items-center rounded-2xl shadow-lg border border-yellow-600/20 relative">
            <div className="absolute inset-0 pointer-events-none z-0" style={{ background: "radial-gradient(circle at 30% 70%, rgba(255,221,98,0.07), transparent 75%)" }} />
            <div className="z-10 w-full">
              <V3CoinsSendForm userId={user.id} />
            </div>
          </div>
        </div>

        {/* Executive Suite Header */}
        <div className="mb-8 text-center">
          <div className="flex justify-center items-center mb-2 animate-fade-in-up">
            <span className="inline-flex items-center bg-gradient-to-r from-yellow-500 via-amber-400 to-orange-400 rounded-full px-4 py-2 shadow-xl luxury-neon-glow border border-yellow-400/40">
              <Crown className="mr-2 w-7 h-7 text-amber-400 drop-shadow-glow animate-bounce" strokeWidth={2.1} />
              <span className="text-3xl font-extrabold bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 bg-clip-text text-transparent luxury-text-glow tracking-wide">
                Producer's Executive Suite
              </span>
            </span>
          </div>
          <p className="mt-4 text-lg theme-text-muted">Oversee high-level productions with golden standard project management.</p>
        </div>

        <DynamicDashboard user={user} userRole="producer" />
      </div>
    </div>
  );
};

export default ProducerDashboard;
