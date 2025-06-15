
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { HardDrive, Calendar, DollarSign, Key, ExternalLink, Trash2 } from 'lucide-react';
import { StorageAllocation } from '@/hooks/useStorageManagement';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface StorageAllocationCardProps {
  allocation: StorageAllocation;
  onTerminate: (id: string) => void;
}

const StorageAllocationCard: React.FC<StorageAllocationCardProps> = ({ allocation, onTerminate }) => {
  const [showCredentials, setShowCredentials] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'terminated': return 'bg-red-500';
      case 'suspended': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  const usagePercentage = allocation.used_gb ? (allocation.used_gb / allocation.size_gb) * 100 : 0;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-white">{allocation.allocation_name}</CardTitle>
          <Badge variant="secondary" className={`${getStatusColor(allocation.status)} text-white`}>
            {allocation.status}
          </Badge>
        </div>
        <p className="text-sm text-gray-400">{allocation.storage_type.toUpperCase()} Storage</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-300">Storage Usage:</span>
            <span className="text-white">
              {allocation.used_gb || 0} / {allocation.size_gb} GB
            </span>
          </div>
          <Progress value={usagePercentage} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-300">
            <HardDrive className="h-4 w-4" />
            <span>{allocation.size_gb} GB</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <DollarSign className="h-4 w-4" />
            <span>{allocation.monthly_rate} V3C/month</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <Calendar className="h-4 w-4" />
            <span>Created {formatDate(allocation.created_at)}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <Key className="h-4 w-4 mr-2" />
                View Credentials
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">Storage Credentials</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300">Access Key</label>
                  <div className="mt-1 p-2 bg-gray-700 rounded text-sm text-white font-mono">
                    {allocation.access_key}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Endpoint URL</label>
                  <div className="mt-1 p-2 bg-gray-700 rounded text-sm text-white font-mono">
                    {allocation.endpoint_url}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Bucket Name</label>
                  <div className="mt-1 p-2 bg-gray-700 rounded text-sm text-white font-mono">
                    v3c-{allocation.id.substring(0, 8)}
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  Keep these credentials secure. They provide access to your storage allocation.
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {allocation.status === 'active' && (
            <Button 
              onClick={() => onTerminate(allocation.id)}
              variant="destructive"
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Terminate Storage
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StorageAllocationCard;
