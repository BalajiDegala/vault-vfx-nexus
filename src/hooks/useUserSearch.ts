
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

export function useUserSearch(query: string, excludeUserId?: string) {
  const [results, setResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query || query.length < 1) {
      setResults([]);
      return;
    }

    let isMounted = true;
    setLoading(true);

    (async () => {
      console.log("Searching for:", query);
      
      let queryBuilder = supabase
        .from("profiles")
        .select("id, username, email, avatar_url, first_name, last_name");

      // Build the search filter - make it more flexible
      const searchQuery = `%${query.toLowerCase()}%`;
      queryBuilder = queryBuilder.or(
        `username.ilike.${searchQuery},email.ilike.${searchQuery},first_name.ilike.${searchQuery},last_name.ilike.${searchQuery}`
      );

      // Only exclude user if excludeUserId is provided and not empty
      if (excludeUserId && excludeUserId.trim() !== "") {
        queryBuilder = queryBuilder.neq("id", excludeUserId);
      }

      const { data, error } = await queryBuilder.limit(10);

      console.log("Search results:", data, "Error:", error);

      if (!isMounted) return;

      if (error) {
        console.error("Search error:", error);
        setResults([]);
      } else {
        setResults(data ?? []);
      }
      setLoading(false);
    })();

    return () => {
      isMounted = false;
    };
  }, [query, excludeUserId]);

  return { results, loading };
}
