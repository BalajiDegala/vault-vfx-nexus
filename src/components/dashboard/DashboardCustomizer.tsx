
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  RotateCcw, 
  GripVertical,
  BarChart3,
  Bell,
  Zap,
  FolderOpen,
  Activity,
  Calendar
} from "lucide-react";
import { DashboardWidget } from "@/types/dashboard";

interface DashboardCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
  widgets: DashboardWidget[];
  onToggleWidget: (widgetId: string) => void;
  onResetToDefault: () => void;
}

const getWidgetIcon = (type: string) => {
  switch (type) {
    case 'stats': return <BarChart3 className="h-4 w-4" />;
    case 'recent_projects': return <FolderOpen className="h-4 w-4" />;
    case 'notifications': return <Bell className="h-4 w-4" />;
    case 'quick_actions': return <Zap className="h-4 w-4" />;
    case 'activity_feed': return <Activity className="h-4 w-4" />;
    case 'project_calendar': return <Calendar className="h-4 w-4" />;
    default: return <Settings className="h-4 w-4" />;
  }
};

const getSizeColor = (size: string) => {
  switch (size) {
    case 'small': return 'bg-green-500/20 text-green-400';
    case 'medium': return 'bg-blue-500/20 text-blue-400';
    case 'large': return 'bg-purple-500/20 text-purple-400';
    default: return 'bg-gray-500/20 text-gray-400';
  }
};

const DashboardCustomizer: React.FC<DashboardCustomizerProps> = ({
  isOpen,
  onClose,
  widgets,
  onToggleWidget,
  onResetToDefault,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Customize Dashboard
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-400">
              Enable or disable widgets to customize your dashboard layout.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onResetToDefault}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset to Default
            </Button>
          </div>

          <div className="space-y-3">
            {widgets.map((widget) => (
              <Card key={widget.id} className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <GripVertical className="h-4 w-4 text-gray-500" />
                      {getWidgetIcon(widget.type)}
                      <div>
                        <h3 className="font-medium">{widget.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant="secondary" 
                            className={getSizeColor(widget.size)}
                          >
                            {widget.size}
                          </Badge>
                          <span className="text-xs text-gray-400 capitalize">
                            {widget.type.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <Switch
                      checked={widget.enabled}
                      onCheckedChange={() => onToggleWidget(widget.id)}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-gray-800/30 rounded-lg p-4">
            <h4 className="font-medium mb-2">Quick Tips:</h4>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Toggle widgets on/off using the switches</li>
              <li>• Drag widgets by the grip handle to reorder (coming soon)</li>
              <li>• Your layout is automatically saved</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DashboardCustomizer;
