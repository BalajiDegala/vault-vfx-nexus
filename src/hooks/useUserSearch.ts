
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query || query.length < 1) {
      setResults([]);
      setError(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    (async () => {
      console.log("Searching for users with query:", query);
      
      try {
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

        const { data, error } = await queryBuilder.limit(50); // Increased limit for better results

        console.log("Search query executed:", queryBuilder);
        console.log("Search results:", data, "Error:", error);

        if (!isMounted) return;

        if (error) {
          console.error("Search error:", error);
          setError(error.message);
          setResults([]);
        } else {
          setResults(data ?? []);
          console.log(`Found ${data?.length || 0} users matching "${query}"`);
        }
      } catch (err) {
        console.error("Unexpected search error:", err);
        if (isMounted) {
          setError("Failed to search users");
          setResults([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [query, excludeUserId]);

  return { results, loading, error };
}
