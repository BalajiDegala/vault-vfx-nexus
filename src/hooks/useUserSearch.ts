
import logger from "@/lib/logger";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface UserProfile {
  id: string;
  username: string | null;
  email: string;
  avatar_url: string | null;
  first_name: string | null;
  last_name: string | null;
}

export function useUserSearch(initialQuery: string = "", excludeUserId?: string) {
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchUsers = async (query: string, userType?: string) => {
    if (!query || query.length < 1) {
      setSearchResults([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      logger.log("Searching for users with query:", query);
      
      let queryBuilder = supabase
        .from("profiles")
        .select("id, username, email, avatar_url, first_name, last_name");

      // Build the search filter - make it more flexible
      const searchQuery = `%${query.toLowerCase()}%`;
      queryBuilder = queryBuilder.or(
        `username.ilike.${searchQuery},email.ilike.${searchQuery},first_name.ilike.${searchQuery},last_name.ilike.${searchQuery}`
      );

      // Exclude specific user if provided
      if (excludeUserId) {
        queryBuilder = queryBuilder.neq('id', excludeUserId);
      }

      // Filter by user type if specified
      if (userType === 'studio') {
        // Add any studio-specific filtering here if needed
        // For now, we'll just search all users
      }

      const { data, error } = await queryBuilder.limit(50);

      logger.log("Search results:", data, "Error:", error);

      if (error) {
        logger.error("Search error:", error);
        setError(error.message);
        setSearchResults([]);
      } else {
        setSearchResults(data ?? []);
        logger.log(`Found ${data?.length || 0} users matching "${query}"`);
      }
    } catch (err) {
      logger.error("Unexpected search error:", err);
      setError("Failed to search users");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Search on mount if initial query provided
  useEffect(() => {
    if (initialQuery) {
      searchUsers(initialQuery);
    }
  }, [initialQuery]);

  return { searchResults, loading, error, searchUsers };
}
