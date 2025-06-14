
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { AppRole } from "@/types/auth";

interface LoginFormProps {
  email: string;
  password: string;
  selectedRole: AppRole | "";
  loading: boolean;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const LoginForm = ({
  email,
  password,
  selectedRole,
  loading,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: LoginFormProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const getRoleTitle = (role: AppRole | "") => {
    const roleTitles = {
      artist: "Freelancer/Artist",
      studio: "Studio",
      producer: "Producer",
      admin: "Admin",
    };
    return role ? roleTitles[role] : "User";
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-gray-300">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
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
            onChange={(e) => onPasswordChange(e.target.value)}
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
        {loading ? "Signing In..." : `Sign In as ${getRoleTitle(selectedRole)}`}
      </Button>
    </form>
  );
};

export default LoginForm;
