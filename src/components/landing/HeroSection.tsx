
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Zap, Crown, Shield } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="mb-8 inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-full px-6 py-2 border border-white/20">
          <Sparkles className="h-4 w-4 text-cyan-400" />
          <span className="text-sm text-gray-200">The Future of VFX Collaboration</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent leading-tight">
          V3 Platform
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-4xl mx-auto leading-relaxed">
          Where Creative Vision Meets Cutting-Edge Technology
        </p>
        
        <p className="text-lg text-gray-400 mb-12 max-w-3xl mx-auto">
          Join the next generation of VFX professionals in a collaborative ecosystem designed for 
          artists, studios, producers, and innovators.
        </p>

        {/* Role-Based CTAs */}
        <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
          <RoleCard
            icon={<Sparkles className="h-8 w-8" />}
            title="Artists"
            description="Unleash your creativity with professional tools"
            gradient="from-purple-500 to-pink-500"
            delay="0"
          />
          <RoleCard
            icon={<Zap className="h-8 w-8" />}
            title="Studios"
            description="Scale your operations with enterprise solutions"
            gradient="from-blue-500 to-cyan-500"
            delay="200"
          />
          <RoleCard
            icon={<Crown className="h-8 w-8" />}
            title="Producers"
            description="Manage productions with golden-standard tools"
            gradient="from-yellow-500 to-orange-500"
            delay="400"
          />
          <RoleCard
            icon={<Shield className="h-8 w-8" />}
            title="Admins"
            description="Oversee platform with advanced controls"
            gradient="from-green-500 to-blue-500"
            delay="600"
          />
        </div>

        {/* Main CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link to="/signup">
            <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          
          <Link to="/login">
            <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold rounded-xl backdrop-blur-sm">
              Sign In
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <StatCard number="10K+" label="Active Artists" />
          <StatCard number="500+" label="Studios" />
          <StatCard number="1M+" label="Assets" />
          <StatCard number="24/7" label="Support" />
        </div>
      </div>
    </section>
  );
};

const RoleCard = ({ icon, title, description, gradient, delay }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  delay: string;
}) => (
  <div 
    className={`group bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-white/30 transition-all duration-500 transform hover:scale-105 animate-fade-in-up`}
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-r ${gradient} mb-4 group-hover:scale-110 transition-transform duration-300`}>
      <div className="text-white">
        {icon}
      </div>
    </div>
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
  </div>
);

const StatCard = ({ number, label }: { number: string; label: string }) => (
  <div className="text-center">
    <div className="text-3xl font-bold text-white mb-1">{number}</div>
    <div className="text-gray-400 text-sm">{label}</div>
  </div>
);

export default HeroSection;
