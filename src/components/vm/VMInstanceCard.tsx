
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import type { VMInstance } from '@/hooks/useVMInstances';

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

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-white">{vm.vm_name}</CardTitle>
          <Badge variant="secondary" className={`${getStatusColor(vm.status)} text-white`}>
            {vm.status}
          </Badge>
        </div>
        <p className="text-sm text-gray-400">Legacy VM Instance</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 p-3 bg-yellow-600/20 border border-yellow-600/30 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-yellow-400" />
          <div className="text-sm text-yellow-200">
            <p className="font-medium">VM Feature Deprecated</p>
            <p>VFX Cloud Platform now uses physical machines for better performance and security.</p>
          </div>
        </div>

        <div className="text-sm text-gray-400">
          <p>Created: {new Date(vm.created_at).toLocaleDateString()}</p>
        </div>

        <Button 
          onClick={() => onTerminate(vm.id)}
          variant="destructive"
          className="w-full"
          disabled
        >
          Feature Deprecated
        </Button>
      </CardContent>
    </Card>
  );
};

export default VMInstanceCard;
