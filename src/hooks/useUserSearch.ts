
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
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    let isMounted = true;
    setLoading(true);

    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, email, avatar_url, first_name, last_name")
        .or(
          `username.ilike.%${query}%,email.ilike.%${query}%`
        )
        .neq("id", excludeUserId ?? "");

      if (!isMounted) return;

      if (error) {
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
