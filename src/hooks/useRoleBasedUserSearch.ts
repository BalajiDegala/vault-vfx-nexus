
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

export interface RoleBasedUser {
  id: string;
  username: string | null;
  email: string;
  avatar_url: string | null;
  first_name: string | null;
  last_name: string | null;
  roles: AppRole[];
  display_name: string;
}

export function useRoleBasedUserSearch() {
  const [searchResults, setSearchResults] = useState<RoleBasedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchUsersByRole = useCallback(async (query: string, targetRoles: AppRole[] = []) => {
    if (!query || query.length < 1) {
      setSearchResults([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Searching for users with roles:", targetRoles, "query:", query);
      
      // First, get users that match the search query
      const searchQuery = `%${query.toLowerCase()}%`;
      let profilesQuery = supabase
        .from("profiles")
        .select("id, username, email, avatar_url, first_name, last_name")
        .or(
          `username.ilike.${searchQuery},email.ilike.${searchQuery},first_name.ilike.${searchQuery},last_name.ilike.${searchQuery}`
        );

      const { data: profilesData, error: profilesError } = await profilesQuery.limit(50);

      if (profilesError) {
        console.error("Profiles search error:", profilesError);
        setError(profilesError.message);
        setSearchResults([]);
        return;
      }

      if (!profilesData || profilesData.length === 0) {
        setSearchResults([]);
        return;
      }

      // Get user IDs for role filtering
      const userIds = profilesData.map(profile => profile.id);

      // Get roles for these users
      let rolesQuery = supabase
        .from("user_roles")
        .select("user_id, role")
        .in("user_id", userIds);

      // Filter by target roles if specified
      if (targetRoles.length > 0) {
        rolesQuery = rolesQuery.in("role", targetRoles);
      }

      const { data: rolesData, error: rolesError } = await rolesQuery;

      if (rolesError) {
        console.error("Roles search error:", rolesError);
        setError(rolesError.message);
        setSearchResults([]);
        return;
      }

      // Create a map of user roles
      const userRolesMap = new Map<string, AppRole[]>();
      rolesData?.forEach(roleEntry => {
        const userId = roleEntry.user_id;
        const role = roleEntry.role;
        if (!userRolesMap.has(userId)) {
          userRolesMap.set(userId, []);
        }
        userRolesMap.get(userId)?.push(role);
      });

      // Filter profiles to only include those with matching roles (if targetRoles specified)
      const filteredProfiles = targetRoles.length > 0 
        ? profilesData.filter(profile => userRolesMap.has(profile.id))
        : profilesData.filter(profile => userRolesMap.has(profile.id)); // Only include users who have roles

      // Transform the data
      const transformedData: RoleBasedUser[] = filteredProfiles.map(user => {
        const roles = userRolesMap.get(user.id) || [];
        const displayName = user.first_name && user.last_name 
          ? `${user.first_name} ${user.last_name}`
          : user.username || user.email;

        return {
          id: user.id,
          username: user.username,
          email: user.email,
          avatar_url: user.avatar_url,
          first_name: user.first_name,
          last_name: user.last_name,
          roles,
          display_name: displayName
        };
      });

      setSearchResults(transformedData);
      console.log(`Found ${transformedData.length} users matching "${query}" with roles:`, targetRoles);
    } catch (err) {
      console.error("Unexpected search error:", err);
      setError("Failed to search users");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchStudios = useCallback((query: string) => {
    return searchUsersByRole(query, ['studio']);
  }, [searchUsersByRole]);

  const searchArtists = useCallback((query: string) => {
    return searchUsersByRole(query, ['artist']);
  }, [searchUsersByRole]);

  const searchAllUsers = useCallback((query: string) => {
    return searchUsersByRole(query, ['studio', 'artist', 'producer']);
  }, [searchUsersByRole]);

  return { 
    searchResults, 
    loading, 
    error, 
    searchUsersByRole,
    searchStudios,
    searchArtists,
    searchAllUsers
  };
}
