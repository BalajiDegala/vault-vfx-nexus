
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
      
      // First, get users with the target roles
      let roleQuery = supabase
        .from("user_roles")
        .select("user_id, role");

      // Filter by target roles if specified
      if (targetRoles.length > 0) {
        roleQuery = roleQuery.in("role", targetRoles);
      }

      const { data: rolesData, error: rolesError } = await roleQuery;

      if (rolesError) {
        console.error("Roles search error:", rolesError);
        setError(rolesError.message);
        setSearchResults([]);
        return;
      }

      if (!rolesData || rolesData.length === 0) {
        console.log("No users found with specified roles:", targetRoles);
        setSearchResults([]);
        return;
      }

      console.log("Found role data:", rolesData);

      // Get unique user IDs that have the target roles
      const userIds = [...new Set(rolesData.map(role => role.user_id))];
      console.log("User IDs with target roles:", userIds);

      // Now get profiles for these users and filter by search query
      const searchQuery = `%${query.toLowerCase()}%`;
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, username, email, avatar_url, first_name, last_name")
        .in("id", userIds)
        .or(
          `username.ilike.${searchQuery},email.ilike.${searchQuery},first_name.ilike.${searchQuery},last_name.ilike.${searchQuery}`
        )
        .limit(50);

      if (profilesError) {
        console.error("Profiles search error:", profilesError);
        setError(profilesError.message);
        setSearchResults([]);
        return;
      }

      console.log("Found profile data:", profilesData);

      if (!profilesData || profilesData.length === 0) {
        setSearchResults([]);
        return;
      }

      // Create a map of user roles
      const userRolesMap = new Map<string, AppRole[]>();
      rolesData.forEach(roleEntry => {
        const userId = roleEntry.user_id;
        const role = roleEntry.role;
        if (!userRolesMap.has(userId)) {
          userRolesMap.set(userId, []);
        }
        userRolesMap.get(userId)?.push(role);
      });

      // Transform the data
      const transformedData: RoleBasedUser[] = profilesData.map(user => {
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

      console.log("Transformed search results:", transformedData);
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
