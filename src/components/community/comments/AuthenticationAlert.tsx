
import { AlertCircle } from 'lucide-react';

const AuthenticationAlert = () => {
  return (
    <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3 text-yellow-400">
      <div className="flex items-center gap-2 mb-2">
        <AlertCircle className="h-4 w-4" />
        <span className="font-medium">Authentication Required</span>
      </div>
      <p className="text-sm">You must be logged in to comment on posts.</p>
    </div>
  );
};

export default AuthenticationAlert;
