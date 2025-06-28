
import logger from "@/lib/logger";
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DCVConnectionStatus {
  isValidating: boolean;
  isConnecting: boolean;
  connectionUrl: string | null;
  vmStatus: string | null;
  dcvAvailable: boolean;
  error: string | null;
  machineInfo?: {
    name: string;
    location: string;
    ip_address: string;
  };
}

export const useDCVConnection = () => {
  const [connectionStatus, setConnectionStatus] = useState<DCVConnectionStatus>({
    isValidating: false,
    isConnecting: false,
    connectionUrl: null,
    vmStatus: null,
    dcvAvailable: false,
    error: null,
  });
  const { toast } = useToast();

  const validateConnection = async (vmInstanceId: string) => {
    setConnectionStatus(prev => ({ ...prev, isValidating: true, error: null }));

    try {
      const { data, error } = await supabase.functions.invoke('manage-dcv-session', {
        body: { action: 'validate_connection', vm_instance_id: vmInstanceId }
      });

      if (error) throw error;

      if (data.success) {
        setConnectionStatus(prev => ({
          ...prev,
          dcvAvailable: data.dcv_available,
          connectionUrl: data.connection_url,
          vmStatus: data.vm_status,
          machineInfo: data.machine_info,
          isValidating: false,
        }));
        return data;
      } else {
        throw new Error(data.error || 'Connection validation failed');
      }
    } catch (error: any) {
      console.error('Connection validation error:', error);
      setConnectionStatus(prev => ({
        ...prev,
        error: error.message,
        isValidating: false,
      }));
      toast({
        title: "Connection Error",
        description: error.message || "Failed to validate DCV connection",
        variant: "destructive",
      });
      throw error;
    }
  };

  const connectToVM = async (vmInstanceId: string, connectionUrl: string) => {
    setConnectionStatus(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      // Generate session token for secure access
      const { data, error } = await supabase.functions.invoke('manage-dcv-session', {
        body: { action: 'generate_session_token', vm_instance_id: vmInstanceId }
      });

      if (error) throw error;

      if (data.success) {
        // Create secure DCV connection URL
        const urlWithToken = `${connectionUrl}?token=${data.session_token}&user=${data.user_id}`;
        
        // Open DCV connection in new window
        const newWindow = window.open(urlWithToken, '_blank', 'noopener,noreferrer,width=1280,height=720');
        
        if (!newWindow) {
          throw new Error('Pop-up blocked. Please allow pop-ups for this site and try again.');
        }

        setConnectionStatus(prev => ({ ...prev, isConnecting: false }));
        
        toast({
          title: "Connected to Remote Desktop",
          description: `DCV session opened to ${connectionStatus.machineInfo?.name || 'remote machine'}`,
        });

        // Monitor connection status
        monitorConnection(vmInstanceId);
      } else {
        throw new Error('Failed to generate session token');
      }
    } catch (error: any) {
      console.error('Connection error:', error);
      setConnectionStatus(prev => ({
        ...prev,
        error: error.message,
        isConnecting: false,
      }));
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to VM",
        variant: "destructive",
      });
      throw error;
    }
  };

  const connectToLocalMachine = async (machineIp: string, port: number = 8443) => {
    setConnectionStatus(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      // Construct local DCV connection URL
      const localDcvUrl = `https://${machineIp}:${port}`;
      
      // Test connection availability
      const testConnection = await fetch(`${localDcvUrl}/health`, { 
        method: 'GET',
        mode: 'no-cors' // Allow cross-origin for local network
      }).catch(() => null);

      // Open DCV connection to local machine
      const newWindow = window.open(localDcvUrl, '_blank', 'noopener,noreferrer,width=1280,height=720');
      
      if (!newWindow) {
        throw new Error('Pop-up blocked. Please allow pop-ups for this site and try again.');
      }

      setConnectionStatus(prev => ({ ...prev, isConnecting: false }));
      
      toast({
        title: "Connected to Local Machine",
        description: `DCV session opened to ${machineIp}`,
      });

    } catch (error: any) {
      console.error('Local connection error:', error);
      setConnectionStatus(prev => ({
        ...prev,
        error: error.message,
        isConnecting: false,
      }));
      toast({
        title: "Local Connection Failed",
        description: error.message || "Failed to connect to local machine",
        variant: "destructive",
      });
      throw error;
    }
  };

  const monitorConnection = (vmInstanceId: string) => {
    // Monitor connection status every 30 seconds
    const interval = setInterval(async () => {
      try {
        await validateConnection(vmInstanceId);
      } catch (error) {
        logger.log('Connection monitoring error:', error);
        clearInterval(interval);
      }
    }, 30000);

    // Clear interval after 5 minutes
    setTimeout(() => clearInterval(interval), 300000);
  };

  return {
    connectionStatus,
    validateConnection,
    connectToVM,
    connectToLocalMachine,
  };
};
