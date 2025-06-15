
import React, { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExternalLink, Wifi, WifiOff, Loader2, AlertTriangle } from 'lucide-react';
import { useDCVConnection } from '@/hooks/useDCVConnection';

interface DCVConnectionStatusProps {
  vmId: string;
  vmStatus: string;
  dcvUrl: string | null;
  onConnect?: () => void;
}

const DCVConnectionStatus: React.FC<DCVConnectionStatusProps> = ({
  vmId,
  vmStatus,
  dcvUrl,
  onConnect
}) => {
  const { connectionStatus, validateConnection, connectToVM } = useDCVConnection();

  useEffect(() => {
    if (vmStatus === 'running' && dcvUrl) {
      validateConnection(vmId);
    }
  }, [vmId, vmStatus, dcvUrl]);

  const handleConnect = async () => {
    if (!dcvUrl) return;
    
    try {
      await connectToVM(vmId, dcvUrl);
      onConnect?.();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const getStatusIcon = () => {
    if (connectionStatus.isValidating) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    if (connectionStatus.dcvAvailable) {
      return <Wifi className="h-4 w-4" />;
    }
    return <WifiOff className="h-4 w-4" />;
  };

  const getStatusBadge = () => {
    if (vmStatus !== 'running') {
      return <Badge variant="secondary">VM Not Running</Badge>;
    }
    if (connectionStatus.isValidating) {
      return <Badge variant="secondary">Checking...</Badge>;
    }
    if (connectionStatus.dcvAvailable) {
      return <Badge className="bg-green-500">DCV Ready</Badge>;
    }
    return <Badge variant="destructive">DCV Unavailable</Badge>;
  };

  if (vmStatus !== 'running') {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <WifiOff className="h-4 w-4" />
        <span>Connection unavailable (VM not running)</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-sm text-gray-300">DCV Connection</span>
          {getStatusBadge()}
        </div>
      </div>

      {connectionStatus.error && (
        <Alert className="bg-red-900/20 border-red-700">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-red-300">
            {connectionStatus.error}
          </AlertDescription>
        </Alert>
      )}

      {connectionStatus.dcvAvailable && (
        <Button
          onClick={handleConnect}
          disabled={connectionStatus.isConnecting}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {connectionStatus.isConnecting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <ExternalLink className="h-4 w-4 mr-2" />
              Connect to Desktop
            </>
          )}
        </Button>
      )}

      {!connectionStatus.dcvAvailable && vmStatus === 'running' && !connectionStatus.isValidating && (
        <Alert className="bg-yellow-900/20 border-yellow-700">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-yellow-300">
            DCV service is not available on this VM. Please contact support.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default DCVConnectionStatus;
