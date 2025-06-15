
import React from "react";
import { useUserSearch } from "@/hooks/useUserSearch";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface UserProfile {
  id: string;
  username: string | null;
  email: string;
  avatar_url: string | null;
  first_name: string | null;
  last_name: string | null;
}

interface UserSearchDropdownProps {
  search: string;
  onChange: (v: string) => void;
  onSelect: (user: UserProfile) => void;
  showDropdown: boolean;
  setShowDropdown: (show: boolean) => void;
  loadingHint?: string;
}

function getDisplayName(profile: UserProfile) {
  if (profile.first_name || profile.last_name) {
    return `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
  }
  return profile.username || profile.email;
}

function getInitials(profile: UserProfile) {
  const name = getDisplayName(profile);
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

const UserSearchDropdown: React.FC<UserSearchDropdownProps> = ({
  search, onChange, onSelect, showDropdown, setShowDropdown, loadingHint
}) => {
  const { searchResults, loading, error, searchUsers } = useUserSearch();

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    onChange(value);
    setShowDropdown(true);
    if (value.length > 0) {
      searchUsers(value);
    }
  }

  const hasSearched = search.length > 0;

  return (
    <div className="relative">
      <input
        placeholder="Search by name, username, or email..."
        value={search}
        onChange={handleInputChange}
        className="bg-gray-800/40 text-white w-full rounded px-3 py-2 border border-blue-900 focus:border-blue-700 focus:outline-none"
        autoComplete="off"
        onFocus={() => hasSearched && setShowDropdown(true)}
      />
      {showDropdown && hasSearched && (
        <div className="absolute z-30 mt-1 w-full bg-gray-800 border border-blue-700 rounded-md shadow-lg max-h-60 overflow-auto">
          {loading && (
            <div className="p-3 text-gray-400 text-sm flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
              {loadingHint || "Searching users..."}
            </div>
          )}
          {error && (
            <div className="p-3 text-red-400 text-sm">
              Error: {error}. Please try again.
            </div>
          )}
          {!loading && !error && searchResults.length === 0 && (
            <div className="p-3 text-gray-300 text-sm">
              <div className="mb-2">No users found for "{search}"</div>
              <div className="text-xs text-gray-500">
                Try searching by:
                <ul className="mt-1 list-disc list-inside">
                  <li>Username (e.g., "john")</li>
                  <li>First or last name</li>
                  <li>Email address</li>
                </ul>
              </div>
            </div>
          )}
          {!loading && !error &&
            searchResults.map((user) => (
              <button
                key={user.id}
                type="button"
                className="flex items-center w-full px-3 py-3 text-left hover:bg-blue-900/70 focus:outline-none focus:bg-blue-900/70 transition border-b border-gray-700 last:border-b-0"
                onClick={() => {onSelect(user); setShowDropdown(false);}}
              >
                <Avatar className="h-8 w-8 mr-3">
                  {user.avatar_url ? (
                    <AvatarImage src={user.avatar_url} alt={getDisplayName(user)} />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                      {getInitials(user)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex flex-col justify-center min-w-0 flex-1">
                  <span className="font-semibold text-gray-100 truncate">
                    {getDisplayName(user)}
                  </span>
                  {user.username && (
                    <span className="text-xs text-blue-400">@{user.username}</span>
                  )}
                  <span className="text-xs text-gray-400 truncate">{user.email}</span>
                </div>
              </button>
            ))}
        </div>
      )}
    </div>
  );
};

export default UserSearchDropdown;
