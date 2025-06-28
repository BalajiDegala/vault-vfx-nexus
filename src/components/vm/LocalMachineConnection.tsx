
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Monitor, Wifi, AlertTriangle, Settings } from 'lucide-react';
import { useDCVConnection } from '@/hooks/useDCVConnection';

const LocalMachineConnection: React.FC = () => {
  const [machineIp, setMachineIp] = useState('');
  const [port, setPort] = useState('8443');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { connectionStatus, connectToLocalMachine } = useDCVConnection();

  const handleConnect = async () => {
    if (!machineIp.trim()) {
      return;
    }
    
    try {
      await connectToLocalMachine(machineIp.trim(), parseInt(port) || 8443);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const validateIpAddress = (ip: string) => {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
  };

  const getCommonLocalIPs = () => [
    '192.168.1.100',
    '192.168.1.101',
    '192.168.0.100',
    '10.0.0.100',
  ];

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Monitor className="h-5 w-5" />
          Connect to Local Machine
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-blue-900/20 border-blue-700">
          <Wifi className="h-4 w-4" />
          <AlertDescription className="text-blue-300">
            Connect directly to a DCV server running on your local network.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <div>
            <Label htmlFor="machine-ip" className="text-gray-300">
              Machine IP Address <span className="text-red-400">*</span>
            </Label>
            <Input
              id="machine-ip"
              value={machineIp}
              onChange={(e) => setMachineIp(e.target.value)}
              placeholder="192.168.1.100"
              className="bg-gray-700 border-gray-600 text-white"
            />
            {machineIp && !validateIpAddress(machineIp) && (
              <p className="text-red-400 text-sm mt-1">Please enter a valid IP address</p>
            )}
          </div>

          <div className="flex gap-2 flex-wrap">
            <span className="text-sm text-gray-400">Quick select:</span>
            {getCommonLocalIPs().map((ip) => (
              <Button
                key={ip}
                variant="outline"
                size="sm"
                onClick={() => setMachineIp(ip)}
                className="text-xs bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
              >
                {ip}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-gray-400 hover:text-white"
            >
              <Settings className="h-4 w-4 mr-1" />
              Advanced Settings
            </Button>
          </div>

          {showAdvanced && (
            <div>
              <Label htmlFor="port" className="text-gray-300">
                DCV Port
              </Label>
              <Input
                id="port"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                placeholder="8443"
                type="number"
                className="bg-gray-700 border-gray-600 text-white"
              />
              <p className="text-gray-500 text-sm mt-1">
                Default DCV port is 8443 (HTTPS) or 8080 (HTTP)
              </p>
            </div>
          )}
        </div>

        {connectionStatus.error && (
          <Alert className="bg-red-900/20 border-red-700">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-red-300">
              {connectionStatus.error}
            </AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleConnect}
          disabled={!machineIp || !validateIpAddress(machineIp) || connectionStatus.isConnecting}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {connectionStatus.isConnecting ? (
            <>
              <Wifi className="h-4 w-4 mr-2 animate-pulse" />
              Connecting...
            </>
          ) : (
            <>
              <Monitor className="h-4 w-4 mr-2" />
              Connect to Desktop
            </>
          )}
        </Button>

        <Alert className="bg-yellow-900/20 border-yellow-700">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-yellow-300 text-sm">
            <strong>Requirements:</strong> The target machine must have DCV Server installed and running.
            Ensure port {port} is accessible on the network.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default LocalMachineConnection;
