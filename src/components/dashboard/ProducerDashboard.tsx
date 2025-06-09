
import { User } from "@supabase/supabase-js";
import DashboardNavbar from "./DashboardNavbar";
import DynamicDashboard from "./DynamicDashboard";

interface ProducerDashboardProps {
  user: User;
}

const ProducerDashboard = ({ user }: ProducerDashboardProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      <DashboardNavbar user={user} userRole="producer" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Producer's Den
          </h1>
          <p className="text-gray-400">Oversee your productions and manage project workflows in real-time.</p>
        </div>

        <DynamicDashboard user={user} userRole="producer" />
      </div>
    </div>
  );
};

export default ProducerDashboard;
