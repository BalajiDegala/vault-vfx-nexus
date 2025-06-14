
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft, User, Building, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

const Signup = () => {
  const [searchParams] = useSearchParams();
  const [selectedRole, setSelectedRole] = useState<AppRole | "">(
    (searchParams.get("role") as AppRole) || ""
  );
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    username: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const roles = [
    {
      id: "artist" as AppRole,
      title: "Freelancer",
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
  ];

  useEffect(() => {
    const roleFromUrl = searchParams.get("role") as AppRole;
    if (roleFromUrl && ["artist", "studio", "producer"].includes(roleFromUrl)) {
      setSelectedRole(roleFromUrl);
    }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const checkProfileExists = async (userId: string, maxAttempts = 10): Promise<boolean> => {
    for (let i = 0; i < maxAttempts; i++) {
      console.log(`Checking for profile (attempt ${i + 1})...`);
      
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .single();

      if (!error && data) {
        console.log("Profile found!");
        return true;
      }
      
      // Wait 1 second before next attempt
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log("Profile not found after waiting");
    return false;
  };

  const createProfileDirectly = async (userId: string): Promise<boolean> => {
    console.log("Creating profile directly...");
    
    const { error } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        username: formData.username,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error("Direct profile creation error:", error);
      return false;
    }

    console.log("Profile created directly!");
    return true;
  };

  const assignRole = async (userId: string, role: AppRole): Promise<boolean> => {
    console.log(`Assigning role ${role} to user ${userId}`);
    
    const { error } = await supabase
      .from("user_roles")
      .insert({
        user_id: userId,
        role
      });

    if (error) {
      console.error("Role assignment error:", error);
      return false;
    }

    console.log("Role assigned successfully!");
    return true;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRole) {
      toast({
        title: "Role Required",
        description: "Please select your role to continue.",
        variant: "destructive",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      console.log("Starting signup process...");

      // Step 1: Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            username: formData.username,
          },
        },
      });

      if (authError) {
        console.error("Auth signup error:", authError);
        toast({
          title: "Signup Failed",
          description: authError.message,
          variant: "destructive",
        });
        return;
      }

      if (!authData.user) {
        console.error("No user returned from signup");
        toast({
          title: "Signup Failed",
          description: "Failed to create user account.",
          variant: "destructive",
        });
        return;
      }

      console.log("User created successfully:", authData.user.id);

      // Step 2: Wait for profile to be created by trigger OR create it directly
      console.log("Waiting for profile to be created...");
      let profileExists = await checkProfileExists(authData.user.id);

      if (!profileExists) {
        console.log("Profile not created by trigger, creating directly...");
        profileExists = await createProfileDirectly(authData.user.id);
      }

      if (!profileExists) {
        toast({
          title: "Setup Error",
          description: "Profile creation failed. Please try again or contact support.",
          variant: "destructive",
        });
        return;
      }

      // Step 3: Assign the role
      console.log("Assigning role...");
      const roleAssigned = await assignRole(authData.user.id, selectedRole as AppRole);

      if (!roleAssigned) {
        toast({
          title: "Role Assignment Failed",
          description: "Account created but role assignment failed. Please contact support.",
          variant: "destructive",
        });
        return;
      }

      console.log("Signup completed successfully!");
      toast({
        title: "Welcome to V3!",
        description: "Account created successfully! You can now log in.",
      });

      // Navigate to login
      navigate("/login");

    } catch (error) {
      console.error("Unexpected signup error:", error);
      toast({
        title: "Signup Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black p-4">
      <div className="container mx-auto max-w-4xl">
        <Link to="/" className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        <Card className="bg-gray-900/80 border-blue-500/20 backdrop-blur-md">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Join the V3 Community
            </CardTitle>
            <p className="text-gray-400">Create your account and start connecting</p>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Role Selection */}
            <div>
              <Label className="text-lg font-semibold text-gray-300 mb-4 block">
                Choose Your Role
              </Label>
              <div className="grid md:grid-cols-3 gap-4">
                {roles.map((role) => {
                  const Icon = role.icon;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setSelectedRole(role.id)}
                      className={`p-6 rounded-lg border-2 transition-all text-left ${
                        selectedRole === role.id
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-gray-600 hover:border-gray-500"
                      }`}
                    >
                      <Icon className={`h-8 w-8 mb-3 ${
                        selectedRole === role.id ? "text-blue-400" : "text-gray-400"
                      }`} />
                      <h3 className={`font-bold mb-2 ${
                        selectedRole === role.id ? "text-blue-400" : "text-white"
                      }`}>
                        {role.title}
                      </h3>
                      <p className="text-sm text-gray-400">{role.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Signup Form */}
            <form onSubmit={handleSignup} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-gray-300">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="Enter your first name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-gray-300">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Enter your last name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-300">Username</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Choose a unique username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-300">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleInputChange}
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

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-300">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || !selectedRole}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-6 text-lg"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-gray-400">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-400 hover:text-blue-300">
                  Sign in here
                </Link>
              </p>
            </div>

            <div className="mt-4 p-3 bg-green-900/20 border border-green-500/20 rounded-lg">
              <p className="text-green-400 text-sm">
                <strong>Ready to Test:</strong> You can now create accounts with any email (doesn't need to be real) and the system will work properly!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
