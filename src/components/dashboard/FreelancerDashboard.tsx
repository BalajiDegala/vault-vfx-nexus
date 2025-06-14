
import { User } from "@supabase/supabase-js";
import { useTheme } from "@/hooks/useTheme";
import DashboardNavbar from "./DashboardNavbar";
import ArtistTasksView from "@/components/artist/ArtistTasksView";
import V3CoinsWallet from "@/components/v3c/V3CoinsWallet";
import V3CoinsSendForm from "@/components/v3c/V3CoinsSendForm";

interface FreelancerDashboardProps {
  user: User;
}

const FreelancerDashboard = ({ user }: FreelancerDashboardProps) => {
  const { getThemeColors } = useTheme('artist');
  const themeColors = getThemeColors('artist');

  return (
    <div className={`min-h-screen bg-gradient-to-br ${themeColors.background}`}>
      <DashboardNavbar user={user} userRole="artist" />
      <div className="container mx-auto px-4 py-8">
        {/* V3C Wallet Section */}
        <V3CoinsWallet userId={user.id} />
        <V3CoinsSendForm userId={user.id} />

        <div className="mb-8">
          <h1 className={`text-3xl font-bold bg-gradient-to-r ${themeColors.primary} bg-clip-text text-transparent mb-2`}>
            Artist Creative Hub
          </h1>
          <p className="theme-text-muted">Unleash your creativity and collaborate on amazing VFX projects.</p>
        </div>

        <ArtistTasksView userId={user.id} />
      </div>
    </div>
  );
};

export default FreelancerDashboard;

