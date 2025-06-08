
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowLeft, Server, Cpu, HardDrive, Zap, Clock } from "lucide-react";

const MachineRental = () => {
  const vmPlans = [
    {
      id: 1,
      name: "Basic VFX",
      cpu: "8 cores",
      ram: "32 GB",
      storage: "500 GB SSD",
      gpu: "RTX 3060",
      price: "50 V3C/hour",
      status: "available",
      description: "Perfect for basic compositing and motion graphics"
    },
    {
      id: 2,
      name: "Pro Studio",
      cpu: "16 cores",
      ram: "64 GB",
      storage: "1 TB SSD",
      gpu: "RTX 4080",
      price: "120 V3C/hour",
      status: "available",
      description: "High-performance for complex VFX and 3D rendering"
    },
    {
      id: 3,
      name: "Enterprise Render",
      cpu: "32 cores",
      ram: "128 GB",
      storage: "2 TB NVMe",
      gpu: "RTX 4090",
      price: "250 V3C/hour",
      status: "limited",
      description: "Maximum power for large-scale productions"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      <div className="container mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Cloud VM Rental
          </h1>
          <p className="text-gray-400 text-lg">
            High-performance virtual machines optimized for VFX, rendering, and creative workflows
          </p>
        </div>

        {/* VM Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {vmPlans.map((plan) => (
            <Card key={plan.id} className="bg-gray-900/80 border-blue-500/20 hover:border-blue-500/40 transition-colors">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-white">{plan.name}</CardTitle>
                  <Badge 
                    variant={plan.status === "available" ? "default" : "secondary"}
                    className={plan.status === "available" ? "bg-green-600" : "bg-yellow-600"}
                  >
                    {plan.status}
                  </Badge>
                </div>
                <p className="text-gray-400 text-sm">{plan.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Cpu className="h-4 w-4 text-blue-400" />
                    <span className="text-gray-300">{plan.cpu}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Server className="h-4 w-4 text-green-400" />
                    <span className="text-gray-300">{plan.ram} RAM</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <HardDrive className="h-4 w-4 text-purple-400" />
                    <span className="text-gray-300">{plan.storage}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-yellow-400" />
                    <span className="text-gray-300">{plan.gpu}</span>
                  </div>
                </div>
                
                <div className="border-t border-gray-700 pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-400">Hourly Rate</span>
                    </div>
                    <span className="text-xl font-bold text-blue-400">{plan.price}</span>
                  </div>
                  
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    disabled={plan.status !== "available"}
                  >
                    {plan.status === "available" ? "Launch VM" : "Notify When Available"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="bg-gray-900/80 border-blue-500/20">
            <CardHeader>
              <CardTitle className="text-white">Why Choose V3 Cloud VMs?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                <div>
                  <h4 className="text-white font-medium">Pre-configured for VFX</h4>
                  <p className="text-gray-400 text-sm">Industry-standard software pre-installed</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                <div>
                  <h4 className="text-white font-medium">Scalable Performance</h4>
                  <p className="text-gray-400 text-sm">Scale up or down based on project needs</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                <div>
                  <h4 className="text-white font-medium">Secure Cloud Storage</h4>
                  <p className="text-gray-400 text-sm">Encrypted storage with automatic backups</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/80 border-blue-500/20">
            <CardHeader>
              <CardTitle className="text-white">Getting Started</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                <div>
                  <h4 className="text-white font-medium">Select Your VM</h4>
                  <p className="text-gray-400 text-sm">Choose the configuration that fits your project</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                <div>
                  <h4 className="text-white font-medium">Launch & Connect</h4>
                  <p className="text-gray-400 text-sm">VM launches in under 60 seconds</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
                <div>
                  <h4 className="text-white font-medium">Start Creating</h4>
                  <p className="text-gray-400 text-sm">Begin your VFX work immediately</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-400 mb-4">Need a custom configuration or have questions?</p>
          <Button variant="outline" className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white">
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MachineRental;
