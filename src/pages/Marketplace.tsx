
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Package, DollarSign, Plus, Star, Download } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import CreateMarketplaceItemModal from "@/components/marketplace/CreateMarketplaceItemModal";

type AppRole = Database["public"]["Enums"]["app_role"];
type MarketplaceCategory = Database["public"]["Enums"]["marketplace_category"];
type MarketplaceItem = Database["public"]["Tables"]["marketplace_items"]["Row"] & {
  profiles: {
    username: string | null;
    first_name: string | null;
    last_name: string | null;
  } | null;
};

const Marketplace = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const categories = [
    { value: "all", label: "All" },
    { value: "training", label: "Training" },
    { value: "assets", label: "Assets" },
    { value: "templates", label: "Templates" },
    { value: "services", label: "Services" }
  ];

  useEffect(() => {
    checkAuth();
    fetchItems();
  }, [selectedCategory]);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/login");
        return;
      }

      setUser(session.user);

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

  const fetchItems = async () => {
    try {
      let query = supabase
        .from("marketplace_items")
        .select(`
          *,
          profiles (
            username,
            first_name,
            last_name
          )
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (selectedCategory !== "all") {
        query = query.eq("category", selectedCategory as MarketplaceCategory);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching marketplace items:", error);
        return;
      }

      setItems(data || []);
    } catch (error) {
      console.error("Error fetching marketplace items:", error);
    }
  };

  const handlePurchase = async (itemId: string, price: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("marketplace_purchases")
        .insert({
          item_id: itemId,
          buyer_id: user.id,
          price_paid: price
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Already Purchased",
            description: "You have already purchased this item.",
            variant: "destructive",
          });
        } else {
          console.error("Purchase error:", error);
          toast({
            title: "Purchase Failed",
            description: "There was an error processing your purchase.",
            variant: "destructive",
          });
        }
        return;
      }

      // Update download count
      const { error: updateError } = await supabase
        .from("marketplace_items")
        .update({ downloads: supabase.sql`downloads + 1` })
        .eq("id", itemId);

      if (updateError) {
        console.error("Error updating download count:", updateError);
      }

      toast({
        title: "Purchase Successful!",
        description: "You can now access this item from your purchases.",
      });

      fetchItems(); // Refresh to update download counts
    } catch (error) {
      console.error("Purchase error:", error);
      toast({
        title: "Purchase Failed",
        description: "There was an error processing your purchase.",
        variant: "destructive",
      });
    }
  };

  const formatSellerName = (profile: MarketplaceItem['profiles']) => {
    if (!profile) return "Unknown Seller";
    if (profile.username) return `@${profile.username}`;
    if (profile.first_name || profile.last_name) {
      return `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    }
    return "Unknown Seller";
  };

  const formatCategoryLabel = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
              VFX Marketplace
            </h1>
            <p className="text-gray-400">
              Discover and sell assets, training, templates, and services for your VFX projects
            </p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Sell Item
          </Button>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <Button
              key={category.value}
              variant={selectedCategory === category.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.value)}
              className={selectedCategory === category.value 
                ? "bg-blue-600 hover:bg-blue-700" 
                : "border-gray-600 text-gray-400 hover:text-white hover:border-gray-500"
              }
            >
              {category.label}
            </Button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <Card key={item.id} className="bg-gray-900/80 border-blue-500/20 backdrop-blur-md hover:border-blue-400/40 transition-colors">
              <CardHeader>
                <div className="aspect-video bg-gray-800 rounded-lg mb-4 flex items-center justify-center">
                  {item.image_url ? (
                    <img 
                      src={item.image_url} 
                      alt={item.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <Package className="h-12 w-12 text-gray-600" />
                  )}
                </div>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-white text-lg mb-2">{item.title}</CardTitle>
                    <Badge 
                      variant="secondary" 
                      className="bg-purple-500/20 text-purple-400 border-purple-500/30 mb-2"
                    >
                      {formatCategoryLabel(item.category)}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-400">${item.price}</div>
                    {item.rating && item.rating > 0 && (
                      <div className="flex items-center text-sm text-yellow-400">
                        <Star className="h-3 w-3 mr-1" />
                        {item.rating.toFixed(1)} ({item.total_ratings})
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-gray-300 text-sm line-clamp-2">{item.description}</p>
                
                <div className="flex items-center justify-between text-gray-400 text-sm">
                  <span>by {formatSellerName(item.profiles)}</span>
                  <div className="flex items-center">
                    <Download className="h-3 w-3 mr-1" />
                    {item.downloads} downloads
                  </div>
                </div>
                
                <Button 
                  onClick={() => handlePurchase(item.id, item.price)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={item.seller_id === user.id}
                >
                  {item.seller_id === user.id ? (
                    "Your Item"
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Purchase
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {items.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-2">
              {selectedCategory === "all" ? "No items available yet." : `No ${selectedCategory} items found.`}
            </p>
            <p className="text-gray-500">Be the first to add items to the marketplace!</p>
          </div>
        )}
      </div>

      <CreateMarketplaceItemModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          fetchItems();
        }}
        userId={user?.id || ""}
      />
    </div>
  );
};

export default Marketplace;
