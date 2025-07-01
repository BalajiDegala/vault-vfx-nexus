
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
      
      let queryBuilder = supabase
        .from("profiles")
        .select(`
          id, 
          username, 
          email, 
          avatar_url, 
          first_name, 
          last_name,
          user_roles!inner(role)
        `);

      // Build the search filter
      const searchQuery = `%${query.toLowerCase()}%`;
      queryBuilder = queryBuilder.or(
        `username.ilike.${searchQuery},email.ilike.${searchQuery},first_name.ilike.${searchQuery},last_name.ilike.${searchQuery}`
      );

      // Filter by roles if specified
      if (targetRoles.length > 0) {
        queryBuilder = queryBuilder.in('user_roles.role', targetRoles);
      }

      const { data, error } = await queryBuilder.limit(50);

      if (error) {
        console.error("Search error:", error);
        setError(error.message);
        setSearchResults([]);
      } else {
        const transformedData: RoleBasedUser[] = (data || []).map(user => {
          const roles = Array.isArray(user.user_roles) 
            ? user.user_roles.map((ur: any) => ur.role)
            : [user.user_roles?.role].filter(Boolean);
          
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
      }
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
