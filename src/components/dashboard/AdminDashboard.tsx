
import { User } from "@supabase/supabase-js";
import { useTheme } from "@/hooks/useTheme";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Database, Server, AlertTriangle } from "lucide-react";
import DashboardNavbar from "./DashboardNavbar";
import V3CoinsWallet from "@/components/v3c/V3CoinsWallet";
import V3CoinsAdminPanel from "@/components/v3c/V3CoinsAdminPanel";

interface AdminDashboardProps {
  user: User;
}

const AdminDashboard = ({ user }: AdminDashboardProps) => {
  const { getThemeColors } = useTheme('admin');
  const themeColors = getThemeColors('admin');

  return (
    <div className={`min-h-screen bg-gradient-to-br ${themeColors.background}`}>
      <DashboardNavbar user={user} userRole="admin" />
      <div className="container mx-auto px-4 py-8">
        {/* V3C Wallet Section */}
        <V3CoinsWallet userId={user.id} />

        {/* Admin V3C Panel */}
        <div className="mb-8">
          <V3CoinsAdminPanel adminUserId={user.id} />
        </div>

        <div className="mb-8">
          <h1 className={`text-3xl font-bold bg-gradient-to-r ${themeColors.primary} bg-clip-text text-transparent mb-2`}>
            Admin Control Panel
          </h1>
          <p className="theme-text-muted">Monitor and manage the V3 platform with administrative privileges.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className={`${themeColors.surface} border-theme-primary/20`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="theme-text-muted text-sm">Total Users</p>
                  <p className="text-2xl font-bold text-theme-primary">1,247</p>
                </div>
                <Users className="h-8 w-8 text-theme-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className={`${themeColors.surface} border-theme-secondary/20`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="theme-text-muted text-sm">Active VMs</p>
                  <p className="text-2xl font-bold text-theme-secondary">45</p>
                </div>
                <Server className="h-8 w-8 text-theme-secondary" />
              </div>
            </CardContent>
          </Card>

          <Card className={`${themeColors.surface} border-theme-accent/20`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="theme-text-muted text-sm">Storage Used</p>
                  <p className="text-2xl font-bold text-theme-accent">12.8TB</p>
                </div>
                <Database className="h-8 w-8 text-theme-accent" />
              </div>
            </CardContent>
          </Card>

          <Card className={`${themeColors.surface} border-theme-error/20`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="theme-text-muted text-sm">System Alerts</p>
                  <p className="text-2xl font-bold text-theme-error">2</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-theme-error" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center py-20">
          <h2 className={`text-2xl font-bold ${themeColors.text} mb-4`}>Admin Panel Coming Soon</h2>
          <p className="theme-text-muted">Advanced administrative features are being developed.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
