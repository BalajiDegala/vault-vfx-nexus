
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, FolderOpen, BarChart3, Calendar } from "lucide-react";
import DashboardNavbar from "./DashboardNavbar";

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
          <p className="text-gray-400">Oversee your productions and manage project workflows.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-900/80 border-blue-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Productions</p>
                  <p className="text-2xl font-bold text-blue-400">5</p>
                </div>
                <Video className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/80 border-green-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Cloud Storage</p>
                  <p className="text-2xl font-bold text-green-400">2.4TB</p>
                </div>
                <FolderOpen className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/80 border-purple-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Budget Utilized</p>
                  <p className="text-2xl font-bold text-purple-400">68%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/80 border-orange-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Upcoming Deadlines</p>
                  <p className="text-2xl font-bold text-orange-400">3</p>
                </div>
                <Calendar className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-white mb-4">Producer Dashboard Coming Soon</h2>
          <p className="text-gray-400">Advanced production management features are being developed.</p>
        </div>
      </div>
    </div>
  );
};

export default ProducerDashboard;
