
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, MessageSquare, Users } from 'lucide-react';
import DirectMessaging from './DirectMessaging';
import { useMessageNotifications } from '@/hooks/useMessageNotifications';
import logger from "@/lib/logger";

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  avatar_url?: string;
  lastMessage?: {
    content: string;
    created_at: string;
    sender_id: string;
  };
  unreadCount?: number;
}

interface MessagesListProps {
  currentUserId: string;
}

const MessagesList = ({ currentUserId }: MessagesListProps) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showMessaging, setShowMessaging] = useState(false);
  const [loading, setLoading] = useState(true);
  const { updateLastRead } = useMessageNotifications(currentUserId);

  useEffect(() => {
    fetchConversations();
  }, [currentUserId]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      
      // Get all users who have exchanged messages with current user
      const { data: messageData, error: messageError } = await supabase
        .from('direct_messages')
        .select(`
          sender_id,
          receiver_id,
          content,
          created_at,
          sender_profile:profiles!direct_messages_sender_id_fkey (
            id,
            first_name,
            last_name,
            username,
            avatar_url
          ),
          receiver_profile:profiles!direct_messages_receiver_id_fkey (
            id,
            first_name,
            last_name,
            username,
            avatar_url
          )
        `)
        .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
        .order('created_at', { ascending: false });

      if (messageError) throw messageError;

      // Process messages to create contact list with last message
      const contactMap = new Map<string, Contact>();
      
      messageData?.forEach((message) => {
        const isCurrentUserSender = message.sender_id === currentUserId;
        const otherUserId = isCurrentUserSender ? message.receiver_id : message.sender_id;
        const otherUserProfile = isCurrentUserSender ? message.receiver_profile : message.sender_profile;

        if (otherUserProfile && !contactMap.has(otherUserId)) {
          contactMap.set(otherUserId, {
            id: otherUserId,
            first_name: otherUserProfile.first_name || '',
            last_name: otherUserProfile.last_name || '',
            username: otherUserProfile.username || '',
            avatar_url: otherUserProfile.avatar_url,
            lastMessage: {
              content: message.content,
              created_at: message.created_at,
              sender_id: message.sender_id
            }
          });
        }
      });

      setContacts(Array.from(contactMap.values()));
    } catch (error) {
      logger.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      fetchConversations();
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, username, avatar_url')
        .neq('id', currentUserId)
        .or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%`)
        .limit(10);

      if (error) throw error;

      const searchResults: Contact[] = (data || []).map(user => ({
        id: user.id,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        username: user.username || '',
        avatar_url: user.avatar_url
      }));

      setContacts(searchResults);
    } catch (error) {
      logger.error('Error searching users:', error);
    }
  };

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
    setShowMessaging(true);
    updateLastRead(); // Mark messages as read when opening conversation
  };

  const getContactDisplayName = (contact: Contact) => {
    if (contact.first_name || contact.last_name) {
      return `${contact.first_name} ${contact.last_name}`.trim();
    }
    return contact.username || 'Unknown User';
  };

  const getInitials = (contact: Contact) => {
    const name = getContactDisplayName(contact);
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const filteredContacts = contacts.filter(contact => {
    if (!searchQuery) return true;
    const displayName = getContactDisplayName(contact).toLowerCase();
    return displayName.includes(searchQuery.toLowerCase());
  });

  return (
    <>
      <Card className="bg-gray-900/80 border-blue-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Messages
          </CardTitle>
          <div className="flex gap-2">
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white"
            />
            <Button 
              onClick={searchUsers}
              variant="outline" 
              size="sm"
              className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center text-gray-400 py-8">
              Loading conversations...
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No conversations yet</p>
              <p className="text-sm">Search for users to start messaging</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => handleContactSelect(contact)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={contact.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {getInitials(contact)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-white font-medium truncate">
                        {getContactDisplayName(contact)}
                      </p>
                      {contact.lastMessage && (
                        <span className="text-xs text-gray-400">
                          {new Date(contact.lastMessage.created_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {contact.lastMessage && (
                      <p className="text-sm text-gray-400 truncate">
                        {contact.lastMessage.sender_id === currentUserId ? 'You: ' : ''}
                        {contact.lastMessage.content}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedContact && (
        <DirectMessaging
          currentUserId={currentUserId}
          recipientId={selectedContact.id}
          recipientName={getContactDisplayName(selectedContact)}
          recipientAvatar={selectedContact.avatar_url}
          open={showMessaging}
          onOpenChange={setShowMessaging}
        />
      )}
    </>
  );
};

export default MessagesList;
