
import { 
  Palette, 
  Cloud, 
  Users, 
  Zap, 
  Shield, 
  Globe,
  Cpu,
  FileVideo,
  Layers
} from "lucide-react";

const FeaturesSection = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-gray-900 to-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Powerful Features for Modern VFX
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Everything you need to create, collaborate, and deliver stunning visual effects
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <FeatureCard
            icon={<Palette className="h-8 w-8" />}
            title="Creative Tools"
            description="Professional-grade tools for artists to bring their vision to life with intuitive interfaces and powerful capabilities."
            gradient="from-purple-500 to-pink-500"
          />
          
          <FeatureCard
            icon={<Cloud className="h-8 w-8" />}
            title="Cloud Rendering"
            description="High-performance cloud infrastructure for rendering complex scenes with unlimited scalability and cost optimization."
            gradient="from-blue-500 to-cyan-500"
          />
          
          <FeatureCard
            icon={<Users className="h-8 w-8" />}
            title="Team Collaboration"
            description="Real-time collaboration tools that keep your team synchronized across projects with seamless communication."
            gradient="from-green-500 to-teal-500"
          />
        </div>

        {/* Technical Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <TechFeature
            icon={<Zap className="h-6 w-6" />}
            title="Lightning Fast"
            description="Optimized performance for real-time workflows"
          />
          
          <TechFeature
            icon={<Shield className="h-6 w-6" />}
            title="Enterprise Security"
            description="Bank-level security for your valuable assets"
          />
          
          <TechFeature
            icon={<Globe className="h-6 w-6" />}
            title="Global CDN"
            description="Worldwide content delivery for instant access"
          />
          
          <TechFeature
            icon={<Cpu className="h-6 w-6" />}
            title="GPU Acceleration"
            description="Hardware-accelerated rendering and processing"
          />
          
          <TechFeature
            icon={<FileVideo className="h-6 w-6" />}
            title="Format Support"
            description="Support for all major VFX file formats"
          />
          
          <TechFeature
            icon={<Layers className="h-6 w-6" />}
            title="Pipeline Integration"
            description="Seamless integration with existing pipelines"
          />
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({ icon, title, description, gradient }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}) => (
  <div className="group bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 hover:border-white/30 transition-all duration-500 transform hover:scale-105">
    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-r ${gradient} mb-6 group-hover:scale-110 transition-transform duration-300`}>
      <div className="text-white">
        {icon}
      </div>
    </div>
    <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
    <p className="text-gray-400 leading-relaxed">{description}</p>
  </div>
);

const TechFeature = ({ icon, title, description }: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className="flex items-start space-x-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300">
    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white">
      {icon}
    </div>
    <div>
      <h4 className="font-semibold text-white mb-1">{title}</h4>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  </div>
);

export default FeaturesSection;
