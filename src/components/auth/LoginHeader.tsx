
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { CardHeader, CardTitle } from "@/components/ui/card";

const LoginHeader = () => {
  return (
    <>
      <Link to="/" className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Home
      </Link>
      
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Welcome Back to V3
        </CardTitle>
        <p className="text-gray-400">Sign in to your account</p>
      </CardHeader>
    </>
  );
};

export default LoginHeader;
