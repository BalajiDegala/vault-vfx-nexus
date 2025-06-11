
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Star, CheckCircle } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-20 right-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Trust Indicators */}
          <div className="flex justify-center items-center space-x-6 mb-8">
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/20">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-200">4.9/5 Rating</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/20">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span className="text-sm text-gray-200">Trusted by 500+ Studios</span>
            </div>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent leading-tight">
            Ready to Transform Your VFX Workflow?
          </h2>
          
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join thousands of creative professionals who are already experiencing the future of visual effects collaboration.
          </p>

          {/* Benefits List */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <BenefitItem text="Start creating in minutes" />
            <BenefitItem text="No setup fees or hidden costs" />
            <BenefitItem text="24/7 professional support" />
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link to="/signup">
              <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-10 py-5 text-xl font-semibold rounded-xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105">
                Get Started Free
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            </Link>
            
            <Link to="/login">
              <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 px-10 py-5 text-xl font-semibold rounded-xl backdrop-blur-sm">
                Sign In
              </Button>
            </Link>
          </div>

          <p className="text-gray-500 text-sm">
            No credit card required • Free trial available • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
};

const BenefitItem = ({ text }: { text: string }) => (
  <div className="flex items-center justify-center space-x-2">
    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
    <span className="text-gray-300">{text}</span>
  </div>
);

export default CTASection;
