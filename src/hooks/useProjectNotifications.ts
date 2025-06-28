
import logger from "@/lib/logger";
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProjectNotification {
  id: string;
  project_id: string;
  user_id: string;
  type: 'message' | 'status_change' | 'assignment' | 'deadline' | 'file_upload';
  title: string;
  content: string | null;
  read: boolean;
  created_at: string;
}

export const useProjectNotifications = (userId: string) => {
  const [notifications, setNotifications] = useState<ProjectNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) return;

    // Fetch initial notifications
    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('project_notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) throw error;

        // Type cast the data to ensure proper typing
        const typedNotifications: ProjectNotification[] = (data || []).map(notification => ({
          ...notification,
          type: notification.type as 'message' | 'status_change' | 'assignment' | 'deadline' | 'file_upload'
        }));

        setNotifications(typedNotifications);
      } catch (error) {
        logger.error('Error fetching notifications:', error);
        toast({
          title: "Error",
          description: "Failed to load notifications",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Subscribe to new notifications
    const channel = supabase
      .channel(`user-notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'project_notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          logger.log('New notification:', payload);
          const typedNotification: ProjectNotification = {
            ...payload.new,
            type: payload.new.type as 'message' | 'status_change' | 'assignment' | 'deadline' | 'file_upload'
          } as ProjectNotification;
          
          setNotifications(prev => [typedNotification, ...prev]);
          
          // Show toast for new notification
          toast({
            title: typedNotification.title,
            description: typedNotification.content || '',
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, toast]);

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('project_notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', userId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      logger.error('Error marking notification as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
  };
};
