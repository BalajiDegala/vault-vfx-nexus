
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Users, TrendingUp, Hash } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import MessagesList from "@/components/messaging/MessagesList";
import { useMessageNotifications } from "@/hooks/useMessageNotifications";

type AppRole = Database["public"]["Enums"]["app_role"];

const Community = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { unreadCount } = useMessageNotifications(user?.id || '');

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        navigate("/login");
        return;
      }

      setUser(session.user);

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .single();

      setUserRole(roleData?.role || "artist");
    } catch (error) {
      console.error("Auth error:", error);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      <DashboardNavbar user={user} userRole={userRole || "artist"} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            VFX Community Hub
          </h1>
          <p className="text-gray-400 text-lg">
            Connect, collaborate, and share with the VFX community
          </p>
        </div>

        <Tabs defaultValue="messages" className="space-y-6">
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Messages
              {unreadCount > 0 && (
                <Badge className="bg-red-500 text-white text-xs px-1 min-w-[1rem] h-4 rounded-full">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="discussions" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Discussions
            </TabsTrigger>
            <TabsTrigger value="trending" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Trending
            </TabsTrigger>
          </TabsList>

          <TabsContent value="messages" className="space-y-6">
            <MessagesList currentUserId={user.id} />
          </TabsContent>

          <TabsContent value="discussions" className="space-y-6">
            <Card className="bg-gray-900/80 border-blue-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Community Discussions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-gray-400 py-8">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">Community Discussions</p>
                  <p className="text-sm">Coming soon - Join conversations about VFX, techniques, and industry trends</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trending" className="space-y-6">
            <Card className="bg-gray-900/80 border-blue-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Hash className="h-5 w-5" />
                  Trending Topics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-gray-400 py-8">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">Trending in VFX</p>
                  <p className="text-sm">Discover what's hot in the VFX community</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Community;
