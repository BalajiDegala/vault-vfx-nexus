
import { AlertCircle } from 'lucide-react';

interface ErrorAlertProps {
  error: string;
}

const ErrorAlert = ({ error }: ErrorAlertProps) => {
  return (
    <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 text-red-400">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4" />
        <span className="text-sm">{error}</span>
      </div>
    </div>
  );
};

export default ErrorAlert;
