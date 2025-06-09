
import { User } from "@supabase/supabase-js";
import DashboardNavbar from "./DashboardNavbar";
import DynamicDashboard from "./DynamicDashboard";

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
          <p className="text-gray-400">Manage your studio operations and talent network with real-time insights.</p>
        </div>

        <DynamicDashboard user={user} userRole="studio" />
      </div>
    </div>
  );
};

export default StudioDashboard;
