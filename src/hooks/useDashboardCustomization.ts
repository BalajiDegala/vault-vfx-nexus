
import { useState, useEffect } from "react";
import { DashboardWidget, DashboardLayout, DEFAULT_WIDGETS } from "@/types/dashboard";

export const useDashboardCustomization = (userId: string) => {
  const [layout, setLayout] = useState<DashboardLayout>({
    userId,
    widgets: DEFAULT_WIDGETS,
    theme: 'default',
    lastUpdated: new Date().toISOString()
  });
  const [isCustomizing, setIsCustomizing] = useState(false);

  useEffect(() => {
    // Load saved layout from localStorage
    const savedLayout = localStorage.getItem(`dashboard-layout-${userId}`);
    if (savedLayout) {
      try {
        const parsed = JSON.parse(savedLayout);
        setLayout(parsed);
      } catch (error) {
        console.error('Error loading dashboard layout:', error);
      }
    }
  }, [userId]);

  const saveLayout = (newLayout: DashboardLayout) => {
    setLayout(newLayout);
    localStorage.setItem(`dashboard-layout-${userId}`, JSON.stringify(newLayout));
  };

  const toggleWidget = (widgetId: string) => {
    const newLayout = {
      ...layout,
      widgets: layout.widgets.map(widget =>
        widget.id === widgetId
          ? { ...widget, enabled: !widget.enabled }
          : widget
      ),
      lastUpdated: new Date().toISOString()
    };
    saveLayout(newLayout);
  };

  const reorderWidgets = (startIndex: number, endIndex: number) => {
    const widgets = Array.from(layout.widgets);
    const [removed] = widgets.splice(startIndex, 1);
    widgets.splice(endIndex, 0, removed);

    // Update positions
    const updatedWidgets = widgets.map((widget, index) => ({
      ...widget,
      position: index + 1
    }));

    const newLayout = {
      ...layout,
      widgets: updatedWidgets,
      lastUpdated: new Date().toISOString()
    };
    saveLayout(newLayout);
  };

  const updateWidgetConfig = (widgetId: string, config: any) => {
    const newLayout = {
      ...layout,
      widgets: layout.widgets.map(widget =>
        widget.id === widgetId
          ? { ...widget, config: { ...widget.config, ...config } }
          : widget
      ),
      lastUpdated: new Date().toISOString()
    };
    saveLayout(newLayout);
  };

  const resetToDefault = () => {
    const defaultLayout = {
      userId,
      widgets: DEFAULT_WIDGETS,
      theme: 'default' as const,
      lastUpdated: new Date().toISOString()
    };
    saveLayout(defaultLayout);
  };

  const enabledWidgets = layout.widgets
    .filter(widget => widget.enabled)
    .sort((a, b) => a.position - b.position);

  return {
    layout,
    enabledWidgets,
    isCustomizing,
    setIsCustomizing,
    toggleWidget,
    reorderWidgets,
    updateWidgetConfig,
    resetToDefault,
    saveLayout
  };
};
