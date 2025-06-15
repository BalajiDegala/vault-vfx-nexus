
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HardDrive, DollarSign, Zap, Shield, Cloud } from 'lucide-react';
import { StoragePlan } from '@/hooks/useStorageManagement';

interface StoragePlanCardProps {
  plan: StoragePlan;
  onSelect: (planName: string) => void;
}

const StoragePlanCard: React.FC<StoragePlanCardProps> = ({ plan, onSelect }) => {
  const getStorageIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 's3': return <Cloud className="h-5 w-5" />;
      case 'ssd': return <Zap className="h-5 w-5" />;
      case 'hdd': return <HardDrive className="h-5 w-5" />;
      default: return <HardDrive className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 's3': return 'bg-blue-500';
      case 'ssd': return 'bg-green-500';
      case 'hdd': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-white flex items-center gap-2">
            {getStorageIcon(plan.storage_type)}
            {plan.display_name}
          </CardTitle>
          <Badge variant="secondary" className={`${getTypeColor(plan.storage_type)} text-white`}>
            {plan.storage_type.toUpperCase()}
          </Badge>
        </div>
        <p className="text-sm text-gray-400">{plan.description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Storage Range:</span>
            <span className="text-white font-semibold">
              {plan.min_size_gb} - {plan.max_size_gb} GB
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Rate per GB:</span>
            <span className="text-yellow-400 font-semibold">
              {plan.monthly_rate_per_gb} V3C/month
            </span>
          </div>
        </div>

        {plan.features && plan.features.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-300">Features:</h4>
            <div className="space-y-1">
              {plan.features.map((feature: string, index: number) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-400">
                  <Shield className="h-3 w-3" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2">
          <Button 
            onClick={() => onSelect(plan.name)}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Select Plan
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StoragePlanCard;
