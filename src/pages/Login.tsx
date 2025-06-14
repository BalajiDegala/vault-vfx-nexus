
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AppRole } from "@/types/auth";
import LoginHeader from "@/components/auth/LoginHeader";
import RoleSelection from "@/components/auth/RoleSelection";
import LoginForm from "@/components/auth/LoginForm";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<AppRole | "">("");
  const [loading, setLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is already authenticated
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          console.log("User already authenticated, redirecting to dashboard");
          navigate("/dashboard");
          return;
        }
      } catch (error) {
        console.error("Session check error:", error);
      } finally {
        setAuthChecking(false);
      }
    };

    checkExistingSession();
  }, [navigate]);

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

      // First, authenticate the user
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error("Authentication error:", authError);
        toast({
          title: "Login Failed",
          description: authError.message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (!authData.user) {
        console.error("No user data returned");
        toast({
          title: "Login Failed",
          description: "Authentication failed.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      console.log("User authenticated successfully:", authData.user.id);

      // Check if user has the selected role
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", authData.user.id)
        .eq("role", selectedRole);

      if (rolesError) {
        console.error("Role check error:", rolesError);
        toast({
          title: "Access Error",
          description: "Unable to verify your roles. Please try again or contact support.",
          variant: "destructive",
        });
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }
      
      console.log("Role check result:", { rolesData, selectedRole });

      // If user doesn't have the selected role, check if they have any roles
      if (!rolesData || rolesData.length === 0) {
        console.log("User does not have the selected role. Checking all user roles...");
        
        const { data: allRolesData, error: allRolesError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", authData.user.id);

        if (allRolesError) {
          console.error("All roles check error:", allRolesError);
          toast({
            title: "Access Error",
            description: "Unable to verify your roles. Please try again or contact support.",
            variant: "destructive",
          });
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        if (!allRolesData || allRolesData.length === 0) {
          console.log("No roles found for user. Assigning selected role.");
          const { error: insertError } = await supabase
            .from("user_roles")
            .insert({ user_id: authData.user.id, role: selectedRole });

          if (insertError) {
            console.error("Failed to assign role:", insertError);
            toast({
              title: "Role Assignment Failed",
              description: "Could not assign your initial role. Please contact support.",
              variant: "destructive",
            });
            await supabase.auth.signOut();
            setLoading(false);
            return;
          }
          console.log(`Role '${selectedRole}' assigned successfully.`);
        } else {
          const userRoles = allRolesData.map(r => r.role as AppRole);
          console.log("User has roles but not the selected one:", userRoles);
          toast({
            title: "Access Denied",
            description: `You don't have the '${selectedRole}' role. Please select one of your available roles: ${userRoles.join(", ")}.`,
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
      }

      // Store the selected role in session storage so Dashboard knows which role to use
      sessionStorage.setItem('selectedRole', selectedRole);

      console.log("Login successful, redirecting to dashboard");
      toast({
        title: "Welcome back!",
        description: `Successfully logged in as ${selectedRole}.`,
      });
      navigate("/dashboard");

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

  if (authChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Checking authentication...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <LoginHeader />
        
        <Card className="bg-gray-900/80 border-blue-500/20 backdrop-blur-md">
          <CardContent className="space-y-6">
            <RoleSelection
              selectedRole={selectedRole}
              onRoleSelect={setSelectedRole}
            />

            <LoginForm
              email={email}
              password={password}
              selectedRole={selectedRole}
              loading={loading}
              onEmailChange={setEmail}
              onPasswordChange={setPassword}
              onSubmit={handleLogin}
            />
            
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
                <strong>Testing:</strong> Create different users with different roles to test the system. 
                Each user can only login with their assigned role.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
