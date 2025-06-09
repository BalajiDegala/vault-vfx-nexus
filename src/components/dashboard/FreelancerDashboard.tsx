
import { User } from "@supabase/supabase-js";
import DashboardNavbar from "./DashboardNavbar";
import DynamicDashboard from "./DynamicDashboard";

interface FreelancerDashboardProps {
  user: User;
}

const FreelancerDashboard = ({ user }: FreelancerDashboardProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      <DashboardNavbar user={user} userRole="artist" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Artist Dashboard
          </h1>
          <p className="text-gray-400">Track your projects, tasks, and progress in real-time.</p>
        </div>

        <DynamicDashboard user={user} userRole="artist" />
      </div>
    </div>
  );
};

export default FreelancerDashboard;
