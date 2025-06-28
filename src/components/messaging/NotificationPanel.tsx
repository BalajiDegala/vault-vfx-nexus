
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, X, Check, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import logger from "@/lib/logger";

interface Notification {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender_profile: {
    first_name: string;
    last_name: string;
    avatar_url: string;
  };
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  unreadCount: number;
  onMarkAllRead: () => void;
}

const NotificationPanel = ({ isOpen, onClose, currentUserId, unreadCount, onMarkAllRead }: NotificationPanelProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    if (!currentUserId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('direct_messages')
        .select(`
          id,
          sender_id,
          content,
          created_at,
          profiles!direct_messages_sender_id_fkey (
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('receiver_id', currentUserId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      const formattedNotifications = (data || [])
        .filter(message => message.profiles) // Only include messages with valid profile data
        .map(message => ({
          id: message.id,
          sender_id: message.sender_id,
          content: message.content,
          created_at: message.created_at,
          sender_profile: {
            first_name: message.profiles?.first_name || '',
            last_name: message.profiles?.last_name || '',
            avatar_url: message.profiles?.avatar_url || ''
          }
        }));
      
      setNotifications(formattedNotifications);
    } catch (error) {
      logger.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && currentUserId) {
      fetchNotifications();
    }
  }, [isOpen, currentUserId]);

  const handleMarkAllRead = () => {
    onMarkAllRead();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-12 right-0 w-80 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50">
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-400" />
          <h3 className="font-semibold text-white">Messages</h3>
          {unreadCount > 0 && (
            <Badge className="bg-red-500 text-white text-xs">
              {unreadCount}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllRead}
              variant="ghost"
              size="sm"
              className="text-blue-400 hover:text-blue-300"
            >
              <Check className="h-4 w-4" />
            </Button>
          )}
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="h-96">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-gray-400">Loading notifications...</div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-gray-400">
            <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
            <p>No messages yet</p>
          </div>
        ) : (
          <div className="p-2">
            {notifications.map((notification) => {
              const senderName = `${notification.sender_profile?.first_name || ''} ${notification.sender_profile?.last_name || ''}`.trim() || 'Someone';
              const avatarFallback = senderName.split(' ').map(n => n[0]).join('').toUpperCase() || 'S';

              return (
                <div
                  key={notification.id}
                  className="flex items-start gap-3 p-3 hover:bg-gray-800 rounded-lg cursor-pointer"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={notification.sender_profile?.avatar_url} />
                    <AvatarFallback className="bg-blue-600 text-white">
                      {avatarFallback}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white text-sm truncate">
                        {senderName}
                      </span>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm line-clamp-2">
                      {notification.content}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      <div className="p-3 border-t border-gray-700">
        <Button className="w-full" variant="outline">
          View All Messages
        </Button>
      </div>
    </div>
  );
};

export default NotificationPanel;
