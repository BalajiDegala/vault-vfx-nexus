
import React, { useState, useEffect } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, ChevronsUpDown, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRoleBasedUserSearch, RoleBasedUser } from '@/hooks/useRoleBasedUserSearch';
import { Database } from '@/integrations/supabase/types';

type AppRole = Database["public"]["Enums"]["app_role"];

interface UserSearchDropdownProps {
  placeholder?: string;
  targetRoles?: AppRole[];
  selectedUser?: RoleBasedUser | null;
  onUserSelect: (user: RoleBasedUser | null) => void;
  disabled?: boolean;
}

const UserSearchDropdown: React.FC<UserSearchDropdownProps> = ({
  placeholder = "Search users...",
  targetRoles = [],
  selectedUser,
  onUserSelect,
  disabled = false
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { searchResults, loading, searchUsersByRole } = useRoleBasedUserSearch();

  useEffect(() => {
    if (searchQuery) {
      const debounceTimer = setTimeout(() => {
        searchUsersByRole(searchQuery, targetRoles);
      }, 300);
      return () => clearTimeout(debounceTimer);
    }
  }, [searchQuery, targetRoles, searchUsersByRole]);

  const getRoleBadgeColor = (role: AppRole) => {
    switch (role) {
      case 'studio': return 'bg-blue-500';
      case 'artist': return 'bg-purple-500';
      case 'producer': return 'bg-yellow-500';
      case 'admin': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getInitials = (user: RoleBasedUser) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    if (user.username) {
      return user.username.slice(0, 2).toUpperCase();
    }
    return user.email.slice(0, 2).toUpperCase();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
          disabled={disabled}
        >
          {selectedUser ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={selectedUser.avatar_url || undefined} />
                <AvatarFallback className="text-xs bg-gray-600">
                  {getInitials(selectedUser)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{selectedUser.display_name}</span>
              <div className="flex gap-1">
                {selectedUser.roles.slice(0, 2).map((role) => (
                  <Badge key={role} className={`${getRoleBadgeColor(role)} text-xs px-1 py-0`}>
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <>
              <User className="h-4 w-4" />
              <span>{placeholder}</span>
            </>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 bg-gray-700 border-gray-600">
        <Command className="bg-gray-700">
          <CommandInput 
            placeholder="Search users..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="text-white"
          />
          <CommandList>
            <CommandEmpty>
              {loading ? "Searching..." : "No users found."}
            </CommandEmpty>
            {searchResults.length > 0 && (
              <CommandGroup>
                {searchResults.map((user) => (
                  <CommandItem
                    key={user.id}
                    value={user.id}
                    onSelect={() => {
                      onUserSelect(user.id === selectedUser?.id ? null : user);
                      setOpen(false);
                    }}
                    className="flex items-center gap-3 p-3 hover:bg-gray-600 cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "h-4 w-4",
                        selectedUser?.id === user.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback className="text-sm bg-gray-600">
                        {getInitials(user)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white truncate">
                        {user.display_name}
                      </div>
                      <div className="text-sm text-gray-300 truncate">
                        {user.username ? `@${user.username}` : user.email}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {user.roles.map((role) => (
                        <Badge key={role} className={`${getRoleBadgeColor(role)} text-xs px-1 py-0`}>
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default UserSearchDropdown;
