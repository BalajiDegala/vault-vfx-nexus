
import { User } from "@supabase/supabase-js";
import { useTheme } from "@/hooks/useTheme";
import DashboardNavbar from "./DashboardNavbar";
import DynamicDashboard from "./DynamicDashboard";
import V3CoinsWallet from "@/components/v3c/V3CoinsWallet";
import V3CoinsSendForm from "@/components/v3c/V3CoinsSendForm";
import { TrendingUp, Briefcase, Zap } from "lucide-react";

interface ProducerDashboardProps {
  user: User;
}

const ProducerDashboard = ({ user }: ProducerDashboardProps) => {
  const { getThemeColors } = useTheme('producer');
  const themeColors = getThemeColors('producer');

  return (
    <div className={`min-h-screen bg-gradient-to-br ${themeColors.background}`}>
      <DashboardNavbar user={user} userRole="producer" />
      
      <div className="container mx-auto px-6 py-8 space-y-8">
        
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-orange-400/20 rounded-xl blur-sm"></div>
              <div className="relative p-3 bg-gray-900/80 border border-amber-400/30 rounded-xl">
                <Briefcase className="w-8 h-8 text-amber-400" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-1">Producer Hub</h1>
              <p className="text-gray-400 text-lg">Production management & oversight</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-400/20 rounded-lg">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            <span className="text-amber-400 font-medium">Executive Access</span>
          </div>
        </div>

        {/* Financial Management Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-semibold text-white">Financial Management</h2>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400/5 to-orange-400/5 rounded-2xl blur-sm group-hover:blur-none transition-all duration-300"></div>
              <div className="relative bg-gray-900/60 backdrop-blur-sm border border-gray-700/50 hover:border-amber-400/30 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-amber-400/10">
                <V3CoinsWallet userId={user.id} />
              </div>
            </div>
            
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400/5 to-amber-400/5 rounded-2xl blur-sm group-hover:blur-none transition-all duration-300"></div>
              <div className="relative bg-gray-900/60 backdrop-blur-sm border border-gray-700/50 hover:border-amber-400/30 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-amber-400/10">
                <V3CoinsSendForm userId={user.id} />
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-800/20 to-gray-900/20 rounded-2xl blur-lg"></div>
          <div className="relative bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-1">
            <div className="bg-gray-900/80 rounded-xl p-6">
              <DynamicDashboard user={user} userRole="producer" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProducerDashboard;
