
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AppRole } from "@/types/auth";
import RoleSelection from "@/components/auth/RoleSelection";
import SignupForm from "@/components/auth/SignupForm";
import { 
  checkProfileExists, 
  createProfileDirectly, 
  assignRole, 
  validateSignupForm 
} from "@/utils/signupHelpers";

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
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const roleFromUrl = searchParams.get("role") as AppRole;
    if (roleFromUrl && ["artist", "studio", "producer"].includes(roleFromUrl)) {
      setSelectedRole(roleFromUrl);
    }
  }, [searchParams]);

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

    if (selectedRole === "admin") {
      toast({
        title: "Signup Not Allowed",
        description: "You cannot sign up as an Admin. Please select another role.",
        variant: "destructive",
      });
      return;
    }

    const validation = validateSignupForm(formData.email, formData.password, formData.confirmPassword);
    if (!validation.isValid) {
      toast({
        title: "Validation Error",
        description: validation.error,
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
        console.error("Profile not created by trigger, creating directly...");
        profileExists = await createProfileDirectly(
          authData.user.id,
          formData.email,
          formData.firstName,
          formData.lastName,
          formData.username
        );
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
            <RoleSelection 
              selectedRole={selectedRole} 
              onRoleSelect={setSelectedRole} 
            />
            {selectedRole === "admin" && (
              <div className="bg-red-800/50 border border-red-600 rounded px-4 py-2 text-red-200 text-sm">
                Signup as <b>Admin</b> is not allowed. Please select another role.
              </div>
            )}
            <SignupForm
              formData={formData}
              onFormDataChange={setFormData}
              onSubmit={handleSignup}
              loading={loading}
              selectedRole={selectedRole}
            />
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
