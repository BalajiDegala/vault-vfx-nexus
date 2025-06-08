
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, DollarSign, Server, Upload, Users, Bell } from "lucide-react";
import DashboardNavbar from "./DashboardNavbar";

interface FreelancerDashboardProps {
  user: User;
}

const FreelancerDashboard = ({ user }: FreelancerDashboardProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      <DashboardNavbar user={user} userRole="freelancer" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user.user_metadata?.first_name || user.email}!
          </h1>
          <p className="text-gray-400">Manage your freelance VFX career from your dashboard.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-900/80 border-blue-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Contracts</p>
                  <p className="text-2xl font-bold text-blue-400">3</p>
                </div>
                <Briefcase className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/80 border-green-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">V3 Coins</p>
                  <p className="text-2xl font-bold text-green-400">1,250</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/80 border-purple-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Portfolio Views</p>
                  <p className="text-2xl font-bold text-purple-400">2,847</p>
                </div>
                <Users className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/80 border-orange-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">VM Sessions</p>
                  <p className="text-2xl font-bold text-orange-400">12</p>
                </div>
                <Server className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Portfolio Management */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-900/80 border-blue-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Upload className="h-5 w-5 mr-2 text-blue-400" />
                  Portfolio Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                    <h4 className="font-semibold text-white mb-2">Latest Showreel</h4>
                    <div className="w-full h-32 bg-gray-700 rounded-lg flex items-center justify-center mb-3">
                      <Upload className="h-8 w-8 text-gray-400" />
                    </div>
                    <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                      Upload New Reel
                    </Button>
                  </div>
                  
                  <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                    <h4 className="font-semibold text-white mb-2">Breakdown Shots</h4>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="h-14 bg-gray-700 rounded"></div>
                      <div className="h-14 bg-gray-700 rounded"></div>
                      <div className="h-14 bg-gray-700 rounded"></div>
                      <div className="h-14 bg-gray-700 rounded"></div>
                    </div>
                    <Button size="sm" variant="outline" className="w-full border-blue-500 text-blue-400">
                      Manage Gallery
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contract Offers */}
            <Card className="bg-gray-900/80 border-purple-500/20 mt-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Briefcase className="h-5 w-5 mr-2 text-purple-400" />
                  Recent Contract Offers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { project: "Sci-Fi Film VFX", studio: "Pixel Studios", budget: "5,000 V3C", status: "pending" },
                    { project: "Commercial CGI", studio: "Creative House", budget: "3,200 V3C", status: "accepted" },
                    { project: "Game Cinematics", studio: "Game Corp", budget: "7,500 V3C", status: "negotiating" },
                  ].map((offer, index) => (
                    <div key={index} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-white">{offer.project}</h4>
                          <p className="text-gray-400 text-sm">{offer.studio}</p>
                        </div>
                        <Badge variant={offer.status === "accepted" ? "default" : "secondary"}>
                          {offer.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-green-400 font-semibold">{offer.budget}</span>
                        <Button size="sm" variant="outline" className="border-blue-500 text-blue-400">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Notifications */}
          <div className="space-y-6">
            <Card className="bg-gray-900/80 border-green-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Server className="h-5 w-5 mr-2 text-green-400" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Rent Cloud VM
                </Button>
                <Button variant="outline" className="w-full border-blue-500 text-blue-400">
                  Browse Projects
                </Button>
                <Button variant="outline" className="w-full border-purple-500 text-purple-400">
                  Update Portfolio
                </Button>
                <Button variant="outline" className="w-full border-orange-500 text-orange-400">
                  Buy V3 Coins
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/80 border-orange-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-orange-400" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-blue-900/30 p-3 rounded border-l-4 border-blue-400">
                    <p className="text-sm text-blue-300">New contract offer from Pixel Studios</p>
                    <p className="text-xs text-gray-400">2 hours ago</p>
                  </div>
                  <div className="bg-green-900/30 p-3 rounded border-l-4 border-green-400">
                    <p className="text-sm text-green-300">Portfolio viewed 15 times today</p>
                    <p className="text-xs text-gray-400">4 hours ago</p>
                  </div>
                  <div className="bg-purple-900/30 p-3 rounded border-l-4 border-purple-400">
                    <p className="text-sm text-purple-300">V3 Coins balance low</p>
                    <p className="text-xs text-gray-400">1 day ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancerDashboard;
