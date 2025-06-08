
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Play, Users, Briefcase, Server, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-blue-500/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                V3
              </Link>
              <div className="hidden md:flex space-x-6">
                <Link to="/profiles" className="hover:text-blue-400 transition-colors">Talent</Link>
                <Link to="/projects" className="hover:text-blue-400 transition-colors">Projects</Link>
                <Link to="/marketplace" className="hover:text-blue-400 transition-colors">Marketplace</Link>
                <Link to="/machine-rental" className="hover:text-blue-400 transition-colors">Cloud VMs</Link>
                <Link to="/community" className="hover:text-blue-400 transition-colors">Community</Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="outline" className="border-blue-500 text-blue-400 hover:bg-blue-500/10">
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Join V3
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
            Virtual Visual Vault
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            The professional VFX platform connecting talent, studios, and producers worldwide
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search for talent, projects, or VFX work..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-6 text-lg bg-white/10 border-blue-500/30 text-white placeholder-gray-400 focus:border-blue-400"
              />
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-20">
            <Link to="/signup?role=freelancer">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 px-8 py-6 text-lg">
                Join as Freelancer
              </Button>
            </Link>
            <Link to="/signup?role=studio">
              <Button size="lg" variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500/10 px-8 py-6 text-lg">
                Join as Studio
              </Button>
            </Link>
            <Link to="/signup?role=producer">
              <Button size="lg" variant="outline" className="border-green-500 text-green-400 hover:bg-green-500/10 px-8 py-6 text-lg">
                Join as Producer
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 p-8 rounded-xl border border-blue-500/20">
            <Users className="h-12 w-12 text-blue-400 mb-4" />
            <h3 className="text-xl font-bold mb-3">Professional Networking</h3>
            <p className="text-gray-300">Connect with VFX professionals, studios, and producers worldwide. Build your network and discover opportunities.</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 p-8 rounded-xl border border-purple-500/20">
            <Briefcase className="h-12 w-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-bold mb-3">Project Management</h3>
            <p className="text-gray-300">Post projects, manage contracts, track progress with advanced analytics and milestone-based payments.</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-900/50 to-green-800/30 p-8 rounded-xl border border-green-500/20">
            <Server className="h-12 w-12 text-green-400 mb-4" />
            <h3 className="text-xl font-bold mb-3">Cloud VMs & Storage</h3>
            <p className="text-gray-300">Access powerful cloud workstations and secure storage. Work remotely with professional VFX software.</p>
          </div>
          
          <div className="bg-gradient-to-br from-cyan-900/50 to-cyan-800/30 p-8 rounded-xl border border-cyan-500/20">
            <Play className="h-12 w-12 text-cyan-400 mb-4" />
            <h3 className="text-xl font-bold mb-3">VFX Marketplace</h3>
            <p className="text-gray-300">Showcase your work in our curated marketplace. Discover inspiring VFX content from top artists.</p>
          </div>
          
          <div className="bg-gradient-to-br from-orange-900/50 to-orange-800/30 p-8 rounded-xl border border-orange-500/20">
            <Shield className="h-12 w-12 text-orange-400 mb-4" />
            <h3 className="text-xl font-bold mb-3">V3 Coins System</h3>
            <p className="text-gray-300">Secure payment system with V3 Coins. Pay for services, rent machines, and manage transactions seamlessly.</p>
          </div>
          
          <div className="bg-gradient-to-br from-pink-900/50 to-pink-800/30 p-8 rounded-xl border border-pink-500/20">
            <Users className="h-12 w-12 text-pink-400 mb-4" />
            <h3 className="text-xl font-bold mb-3">Role-Based Access</h3>
            <p className="text-gray-300">Tailored dashboards for freelancers, studios, and producers with advanced security and access controls.</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">1,000+</div>
              <div className="text-gray-300">VFX Professionals</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-400 mb-2">500+</div>
              <div className="text-gray-300">Active Projects</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-400 mb-2">50+</div>
              <div className="text-gray-300">Studios Connected</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-cyan-400 mb-2">24/7</div>
              <div className="text-gray-300">Cloud Access</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-blue-500/20 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-blue-400">V3 Platform</h3>
              <p className="text-gray-400">Empowering the VFX industry with professional networking, project management, and cloud computing solutions.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/profiles" className="hover:text-blue-400">Find Talent</Link></li>
                <li><Link to="/projects" className="hover:text-blue-400">Browse Projects</Link></li>
                <li><Link to="/marketplace" className="hover:text-blue-400">Marketplace</Link></li>
                <li><Link to="/machine-rental" className="hover:text-blue-400">Cloud VMs</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Community</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/community" className="hover:text-blue-400">Forums</Link></li>
                <li><Link to="/about" className="hover:text-blue-400">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-blue-400">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/terms" className="hover:text-blue-400">Terms of Service</Link></li>
                <li><Link to="/privacy" className="hover:text-blue-400">Privacy Policy</Link></li>
                <li><Link to="/membership" className="hover:text-blue-400">Membership</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Virtual Visual Vault. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
