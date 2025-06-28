
import { useState, useEffect } from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserPlus, MessageSquare, MapPin, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUserFollow } from '@/hooks/useUserFollow';
import logger from "@/lib/logger";

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  bio: string;
  location: string;
  website: string;
  avatar_url: string;
  skills: string[];
  followers_count: number;
  following_count: number;
  portfolio_count: number;
}

interface UserHoverCardProps {
  username: string;
  currentUserId?: string;
  children: React.ReactNode;
  onMessageUser?: (profile: UserProfile) => void;
}

const UserHoverCard = ({ username, currentUserId, children, onMessageUser }: UserHoverCardProps) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  
  const { isFollowing, loading: followLoading, toggleFollow } = useUserFollow(
    currentUserId || '',
    profile?.id || ''
  );

  const fetchUserProfile = async () => {
    if (!username || profile) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username.toLowerCase())
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      logger.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen && !profile && !loading) {
      fetchUserProfile();
    }
  };

  const getDisplayName = (profile: UserProfile) => {
    if (profile.first_name || profile.last_name) {
      return `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    }
    return profile.username || 'Unknown User';
  };

  const getInitials = (profile: UserProfile) => {
    const name = getDisplayName(profile);
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <HoverCard open={open} onOpenChange={handleOpenChange}>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent className="w-80 bg-gray-900 border-gray-700">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          </div>
        ) : profile ? (
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {getInitials(profile)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h4 className="text-lg font-semibold text-white truncate">
                  {getDisplayName(profile)}
                </h4>
                <p className="text-blue-400 text-sm">@{profile.username}</p>
                <div className="flex items-center gap-4 text-sm text-gray-400 mt-2">
                  <span>{profile.followers_count} followers</span>
                  <span>{profile.following_count} following</span>
                  <span>{profile.portfolio_count} works</span>
                </div>
              </div>
            </div>

            {profile.bio && (
              <p className="text-gray-300 text-sm">{profile.bio}</p>
            )}

            {profile.location && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <MapPin className="h-3 w-3" />
                {profile.location}
              </div>
            )}

            {profile.website && (
              <div className="flex items-center gap-2 text-sm text-blue-400">
                <Globe className="h-3 w-3" />
                <a 
                  href={profile.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline truncate"
                >
                  {profile.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}

            {profile.skills && profile.skills.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {profile.skills.slice(0, 3).map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {profile.skills.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{profile.skills.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {currentUserId && currentUserId !== profile.id && (
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleFollow}
                  disabled={followLoading}
                  className={`flex-1 border-purple-500 ${
                    isFollowing 
                      ? "bg-purple-500 text-white" 
                      : "text-purple-400 hover:bg-purple-500 hover:text-white"
                  }`}
                >
                  <UserPlus className="h-3 w-3 mr-1" />
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
                {onMessageUser && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onMessageUser(profile)}
                    className="border-green-500 text-green-400 hover:bg-green-500 hover:text-white"
                  >
                    <MessageSquare className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-400">
            User not found
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  );
};

export default UserHoverCard;
