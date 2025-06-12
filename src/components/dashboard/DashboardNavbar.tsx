
import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { Database } from "@/integrations/supabase/types";
import { 
  Home, 
  FolderOpen, 
  Users, 
  MessageSquare, 
  Server, 
  ShoppingCart, 
  Settings, 
  LogOut,
  User as UserIcon
} from "lucide-react";

type AppRole = Database["public"]["Enums"]["app_role"];

interface DashboardNavbarProps {
  user: User | null;
  userRole: AppRole;
}

const DashboardNavbar = ({ user, userRole }: DashboardNavbarProps) => {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await supabase.auth.signOut();
    navigate("/login");
  };

  const getInitials = (user: User) => {
    const email = user.email || "";
    return email.substring(0, 2).toUpperCase();
  };

  const navigationItems = [
    { label: "Dashboard", icon: Home, path: "/dashboard" },
    { label: "Projects", icon: FolderOpen, path: "/projects" },
    { label: "Talent", icon: Users, path: "/profile-discovery" },
    { label: "Community", icon: MessageSquare, path: "/community" },
    { label: "Machines", icon: Server, path: "/machine-rental" },
    { label: "Marketplace", icon: ShoppingCart, path: "/marketplace" },
  ];

  return (
    <nav className="bg-gray-900/95 backdrop-blur-md border-b border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">V3</span>
            </div>
            <span className="text-white font-semibold text-lg">VFX Nexus</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button 
                  variant="ghost" 
                  className="text-gray-300 hover:text-white hover:bg-gray-800 flex items-center space-x-2"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 hover:bg-gray-800">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                      {user ? getInitials(user) : "??"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-gray-300 hidden sm:block">
                    {user?.email?.split("@")[0] || "User"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-gray-800 border-gray-700">
                <div className="px-2 py-1.5">
                  <p className="text-sm text-gray-400">Signed in as</p>
                  <p className="text-sm font-medium text-white truncate">{user?.email}</p>
                  <p className="text-xs text-blue-400 capitalize">{userRole} Account</p>
                </div>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem asChild className="cursor-pointer hover:bg-gray-700">
                  <Link to="/profiles" className="flex items-center">
                    <UserIcon className="h-4 w-4 mr-2" />
                    My Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer hover:bg-gray-700">
                  <Link to="/settings" className="flex items-center">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="cursor-pointer hover:bg-gray-700 text-red-400 hover:text-red-300"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {isLoggingOut ? "Signing out..." : "Sign out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavbar;
