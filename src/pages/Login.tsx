
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft, User, Building, Video, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<AppRole | "">("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const roles = [
    {
      id: "artist" as AppRole,
      title: "Freelancer/Artist",
      description: "VFX Artist, Animator, or Technical Specialist",
      icon: User,
    },
    {
      id: "studio" as AppRole,
      title: "Studio",
      description: "VFX Studio or Production Company",
      icon: Building,
    },
    {
      id: "producer" as AppRole,
      title: "Producer",
      description: "Film Producer or Project Manager",
      icon: Video,
    },
    {
      id: "admin" as AppRole,
      title: "Admin",
      description: "Platform Administrator",
      icon: Shield,
    },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRole) {
      toast({
        title: "Role Required",
        description: "Please select your role to continue.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      console.log("Attempting login with:", { email, role: selectedRole });

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error);
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data.user) {
        console.log("User logged in:", data.user.id);
        
        // Check if user has the selected role
        const { data: roleData, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id)
          .eq("role", selectedRole);

        console.log("Role check result:", { roleData, roleError, selectedRole });

        if (roleError) {
          console.error("Role check error:", roleError);
          toast({
            title: "Access Error",
            description: "Unable to verify your role. Please try again.",
            variant: "destructive",
          });
          await supabase.auth.signOut();
          return;
        }

        if (!roleData || roleData.length === 0) {
          console.log("User does not have the selected role");
          toast({
            title: "Access Denied",
            description: `You don't have the ${selectedRole} role. Please contact an administrator or select a different role.`,
            variant: "destructive",
          });
          await supabase.auth.signOut();
          return;
        }

        console.log("Login successful, redirecting to dashboard");
        toast({
          title: "Welcome back!",
          description: `Successfully logged in as ${selectedRole}.`,
        });
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Unexpected login error:", error);
      toast({
        title: "Login Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Link to="/" className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
        
        <Card className="bg-gray-900/80 border-blue-500/20 backdrop-blur-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Welcome Back to V3
            </CardTitle>
            <p className="text-gray-400">Sign in to your account</p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Role Selection */}
            <div>
              <Label className="text-lg font-semibold text-gray-300 mb-4 block">
                Select Your Role
              </Label>
              <div className="grid md:grid-cols-2 gap-3">
                {roles.map((role) => {
                  const Icon = role.icon;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setSelectedRole(role.id)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        selectedRole === role.id
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-gray-600 hover:border-gray-500"
                      }`}
                    >
                      <Icon className={`h-6 w-6 mb-2 ${
                        selectedRole === role.id ? "text-blue-400" : "text-gray-400"
                      }`} />
                      <h3 className={`font-bold mb-1 text-sm ${
                        selectedRole === role.id ? "text-blue-400" : "text-white"
                      }`}>
                        {role.title}
                      </h3>
                      <p className="text-xs text-gray-400">{role.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <Button
                type="submit"
                disabled={loading || !selectedRole}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {loading ? "Signing In..." : `Sign In as ${selectedRole ? roles.find(r => r.id === selectedRole)?.title : 'User'}`}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Don't have an account?{" "}
                <Link to="/signup" className="text-blue-400 hover:text-blue-300">
                  Sign up here
                </Link>
              </p>
            </div>

            <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/20 rounded-lg">
              <p className="text-blue-400 text-sm">
                <strong>Note:</strong> You can only log in with roles that have been assigned to your account. 
                Contact an administrator if you need additional role access.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
