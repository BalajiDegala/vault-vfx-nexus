
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Cpu, Monitor, HardDrive, Zap, Coins } from 'lucide-react';
import type { VMPlan } from '@/hooks/useVMInstances';

interface VMPlanCardProps {
  plan: VMPlan;
  onLaunch: (planName: string) => void;
  disabled?: boolean;
}

const VMPlanCard: React.FC<VMPlanCardProps> = ({ plan, onLaunch, disabled }) => {
  return (
    <Card className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-white">{plan.display_name}</CardTitle>
          {plan.gpu_included && (
            <Badge variant="secondary" className="bg-purple-600 text-white">
              GPU
            </Badge>
          )}
        </div>
        <p className="text-sm text-gray-400">{plan.description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Cpu className="h-4 w-4" />
            <span>{plan.cpu_cores} cores</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Monitor className="h-4 w-4" />
            <span>{plan.ram_gb} GB RAM</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <HardDrive className="h-4 w-4" />
            <span>{plan.storage_gb} GB</span>
          </div>
          {plan.gpu_included && (
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Zap className="h-4 w-4" />
              <span>{plan.gpu_model}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-yellow-400" />
            <span className="text-sm text-gray-300">Hourly rate:</span>
          </div>
          <span className="text-lg font-semibold text-yellow-400">
            {plan.hourly_rate} {plan.currency}
          </span>
        </div>

        <Button 
          onClick={() => onLaunch(plan.name)}
          disabled={disabled}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          Launch VM
        </Button>
      </CardContent>
    </Card>
  );
};

export default VMPlanCard;
