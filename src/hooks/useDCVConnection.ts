
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
        // Append session token to connection URL
        const urlWithToken = `${connectionUrl}?token=${data.session_token}`;
        
        // Open in new window/tab
        const newWindow = window.open(urlWithToken, '_blank', 'noopener,noreferrer');
        
        if (!newWindow) {
          throw new Error('Pop-up blocked. Please allow pop-ups for this site and try again.');
        }

        setConnectionStatus(prev => ({ ...prev, isConnecting: false }));
        
        toast({
          title: "Connected",
          description: "DCV session opened in new window",
        });
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

  return {
    connectionStatus,
    validateConnection,
    connectToVM,
  };
};
