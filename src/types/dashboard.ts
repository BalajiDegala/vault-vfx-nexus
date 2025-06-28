
export interface DashboardWidget {
  id: string;
  type: 'stats' | 'recent_projects' | 'notifications' | 'quick_actions' | 'activity_feed' | 'project_calendar';
  title: string;
  enabled: boolean;
  position: number;
  size: 'small' | 'medium' | 'large';
  config?: {
    showCount?: number;
    timeRange?: 'week' | 'month' | 'quarter';
    [key: string]: unknown;
  };
}

export interface DashboardLayout {
  userId: string;
  widgets: DashboardWidget[];
  theme: 'default' | 'compact' | 'detailed';
  lastUpdated: string;
}

export const DEFAULT_WIDGETS: DashboardWidget[] = [
  {
    id: 'project-stats',
    type: 'stats',
    title: 'Project Statistics',
    enabled: true,
    position: 1,
    size: 'large',
    config: {
      timeRange: 'month'
    }
  },
  {
    id: 'recent-projects',
    type: 'recent_projects',
    title: 'Recent Projects',
    enabled: true,
    position: 2,
    size: 'medium',
    config: {
      showCount: 5
    }
  },
  {
    id: 'notifications',
    type: 'notifications',
    title: 'Recent Notifications',
    enabled: true,
    position: 3,
    size: 'medium',
    config: {
      showCount: 3
    }
  },
  {
    id: 'quick-actions',
    type: 'quick_actions',
    title: 'Quick Actions',
    enabled: true,
    position: 4,
    size: 'small'
  }
];
