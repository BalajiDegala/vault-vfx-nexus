
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import type { VMPlan } from '@/hooks/useVMInstances';

interface VMPlanCardProps {
  plan: VMPlan;
  onLaunch: (planName: string) => void;
  disabled?: boolean;
}

const VMPlanCard: React.FC<VMPlanCardProps> = ({ plan, onLaunch, disabled }) => {
  return (
    <Card className="bg-gray-800 border-gray-700 opacity-60">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-white">{plan.display_name}</CardTitle>
        </div>
        <p className="text-sm text-gray-400">{plan.description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 p-3 bg-yellow-600/20 border border-yellow-600/30 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-yellow-400" />
          <div className="text-sm text-yellow-200">
            <p className="font-medium">VM Plans Deprecated</p>
            <p>Use physical machine assignments instead</p>
          </div>
        </div>

        <Button 
          onClick={() => onLaunch(plan.name)}
          disabled={true}
          className="w-full bg-gray-600 cursor-not-allowed"
        >
          Feature Deprecated
        </Button>
      </CardContent>
    </Card>
  );
};

export default VMPlanCard;
