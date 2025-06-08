
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Package, DollarSign } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

const Marketplace = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Mock marketplace items for demonstration
  const marketplaceItems = [
    {
      id: 1,
      title: "Cinema 4D Advanced Course",
      description: "Complete Cinema 4D course with advanced techniques and real-world projects",
      price: 149,
      category: "Training",
      seller: "VFX Academy",
      rating: 4.8,
      image: "/placeholder.svg"
    },
    {
      id: 2,
      title: "Professional VFX Asset Pack",
      description: "High-quality VFX assets including explosions, smoke, and particle effects",
      price: 89,
      category: "Assets",
      seller: "Digital Effects Studio",
      rating: 4.9,
      image: "/placeholder.svg"
    },
    {
      id: 3,
      title: "After Effects Templates Bundle",
      description: "50+ professional After Effects templates for motion graphics",
      price: 59,
      category: "Templates",
      seller: "Motion Graphics Pro",
      rating: 4.7,
      image: "/placeholder.svg"
    },
    {
      id: 4,
      title: "3D Character Rigging Service",
      description: "Professional character rigging service for your 3D models",
      price: 299,
      category: "Services",
      seller: "3D Animation Expert",
      rating: 5.0,
      image: "/placeholder.svg"
    },
    {
      id: 5,
      title: "Compositing Masterclass",
      description: "Learn advanced compositing techniques from industry professionals",
      price: 199,
      category: "Training",
      seller: "Comp Masters",
      rating: 4.9,
      image: "/placeholder.svg"
    },
    {
      id: 6,
      title: "HDRI Environment Pack",
      description: "200+ high-resolution HDRI environments for realistic lighting",
      price: 39,
      category: "Assets",
      seller: "Environment Studio",
      rating: 4.6,
      image: "/placeholder.svg"
    }
  ];

  const categories = ["All", "Training", "Assets", "Templates", "Services"];
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredItems = selectedCategory === "All" 
    ? marketplaceItems 
    : marketplaceItems.filter(item => item.category === selectedCategory);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate("/login");
          return;
        }

        setUser(session.user);

        // Get user roles
        const { data: rolesData, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id);

        if (roleError) {
          console.error("Role fetch error:", roleError);
          navigate("/login");
          return;
        }

        if (!rolesData || rolesData.length === 0) {
          navigate("/login");
          return;
        }

        const roles = rolesData.map(r => r.role);
        let selectedRole: AppRole = roles[0];

        if (roles.includes('admin')) selectedRole = 'admin';
        else if (roles.includes('producer')) selectedRole = 'producer';
        else if (roles.includes('studio')) selectedRole = 'studio';
        else if (roles.includes('artist')) selectedRole = 'artist';

        setUserRole(selectedRole);
      } catch (error) {
        console.error("Auth check error:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handlePurchase = (itemId: number) => {
    toast({
      title: "Coming Soon!",
      description: "Marketplace purchasing will be available soon.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  if (!user || !userRole) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      <DashboardNavbar user={user} userRole={userRole} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
            VFX Marketplace
          </h1>
          <p className="text-gray-400">
            Discover assets, training, templates, and services for your VFX projects
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={selectedCategory === category 
                ? "bg-blue-600 hover:bg-blue-700" 
                : "border-gray-600 text-gray-400 hover:text-white hover:border-gray-500"
              }
            >
              {category}
            </Button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <Card key={item.id} className="bg-gray-900/80 border-blue-500/20 backdrop-blur-md hover:border-blue-400/40 transition-colors">
              <CardHeader>
                <div className="aspect-video bg-gray-800 rounded-lg mb-4 flex items-center justify-center">
                  <Package className="h-12 w-12 text-gray-600" />
                </div>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-white text-lg mb-2">{item.title}</CardTitle>
                    <Badge 
                      variant="secondary" 
                      className="bg-purple-500/20 text-purple-400 border-purple-500/30 mb-2"
                    >
                      {item.category}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-400">${item.price}</div>
                    <div className="text-sm text-yellow-400">★ {item.rating}</div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-gray-300 text-sm">{item.description}</p>
                
                <div className="text-gray-400 text-sm">
                  by {item.seller}
                </div>
                
                <Button 
                  onClick={() => handlePurchase(item.id)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Purchase
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No items found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
