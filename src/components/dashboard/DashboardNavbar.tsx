
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { User } from "@supabase/supabase-js";
import { Link, useNavigate } from "react-router-dom";
import { 
  LogOut, 
  User as UserIcon, 
  Settings, 
  Menu, 
  X,
  Home,
  Briefcase,
  Users,
  Server,
  ShoppingCart,
  MessageSquare
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DashboardNavbarProps {
  user: User | null;
  userRole: string;
}

const DashboardNavbar = ({ user, userRole }: DashboardNavbarProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out successfully",
        description: "Come back soon!",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Logout Error",
        description: "An error occurred while logging out.",
        variant: "destructive",
      });
    }
  };

  const navigationItems = [
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "Projects", href: "/projects", icon: Briefcase },
    { label: "Talent", href: "/profiles", icon: Users },
    { label: "Marketplace", href: "/marketplace", icon: ShoppingCart },
    { label: "Cloud VMs", href: "/machine-rental", icon: Server },
    { label: "Community", href: "/community", icon: MessageSquare },
  ];

  // Show loading state if user is null
  if (!user) {
    return (
      <nav className="bg-black/90 backdrop-blur-md border-b border-blue-500/20 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              V3
            </Link>
            <div className="text-gray-300">Loading...</div>
          </div>
        </div>
      </nav>
    );
  }

  const displayName = user.user_metadata?.first_name || user.email || "User";

  return (
    <nav className="bg-black/90 backdrop-blur-md border-b border-blue-500/20 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            V3
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className="flex items-center space-x-1 text-gray-300 hover:text-blue-400 transition-colors"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-white">
                  {displayName}
                </p>
                <p className="text-xs text-gray-400 capitalize">{userRole}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                <UserIcon className="h-4 w-4 text-white" />
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-400 hover:text-red-400"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-800 py-4">
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:text-blue-400 hover:bg-gray-800/50 rounded"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <div className="border-t border-gray-800 pt-2 mt-2">
                <div className="flex items-center space-x-3 px-3 py-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                    <UserIcon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {displayName}
                    </p>
                    <p className="text-xs text-gray-400 capitalize">{userRole}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default DashboardNavbar;
