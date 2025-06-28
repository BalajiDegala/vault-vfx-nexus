
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Cpu, Monitor, HardDrive, Zap, MapPin, Network } from 'lucide-react';
import type { VMInstance } from '@/hooks/useVMInstances';
import DCVConnectionStatus from './DCVConnectionStatus';

interface VMInstanceCardProps {
  vm: VMInstance;
  onTerminate: (id: string) => void;
  onConnect: (url: string) => void;
}

const VMInstanceCard: React.FC<VMInstanceCardProps> = ({ vm, onTerminate, onConnect }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'provisioning': return 'bg-yellow-500';
      case 'stopped': return 'bg-gray-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-white">{vm.vm_name}</CardTitle>
          <Badge variant="secondary" className={`${getStatusColor(vm.status)} text-white`}>
            {vm.status}
          </Badge>
        </div>
        <p className="text-sm text-gray-400">{vm.vm_plan_name}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-300">
            <Cpu className="h-4 w-4" />
            <span>{vm.cpu_cores} cores</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <Monitor className="h-4 w-4" />
            <span>{vm.ram_gb} GB RAM</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <HardDrive className="h-4 w-4" />
            <span>{vm.storage_gb} GB storage</span>
          </div>
          {vm.gpu_allocated && (
            <div className="flex items-center gap-2 text-gray-300">
              <Zap className="h-4 w-4" />
              <span>GPU enabled</span>
            </div>
          )}
        </div>

        {vm.physical_machines && (
          <div className="space-y-2 p-3 bg-gray-700 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <MapPin className="h-4 w-4" />
              <span className="font-medium">{vm.physical_machines.name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Network className="h-4 w-4" />
              <span>{vm.physical_machines.ip_address}</span>
            </div>
            <div className="text-sm text-gray-400">
              Location: {vm.physical_machines.location}
            </div>
            {vm.physical_machines.dcv_enabled && (
              <Badge variant="outline" className="text-xs border-green-500 text-green-400">
                DCV Enabled
              </Badge>
            )}
          </div>
        )}

        {vm.status === 'running' && vm.current_runtime_minutes !== undefined && (
          <div className="space-y-2 p-3 bg-gray-700 rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Runtime:</span>
              <span className="text-white">{formatRuntime(vm.current_runtime_minutes)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Current cost:</span>
              <span className="text-yellow-400">{vm.current_cost} V3C</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Hourly rate:</span>
              <span className="text-gray-400">{vm.hourly_rate} V3C/hour</span>
            </div>
          </div>
        )}

        {/* DCV Connection Status */}
        <DCVConnectionStatus
          vmId={vm.id}
          vmStatus={vm.status}
          dcvUrl={vm.dcv_connection_url}
          onConnect={() => onConnect(vm.dcv_connection_url!)}
        />

        {/* Terminate Button */}
        {vm.status !== 'terminated' && (
          <Button 
            onClick={() => onTerminate(vm.id)}
            variant="destructive"
            className="w-full"
          >
            Terminate VM
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default VMInstanceCard;
