
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useArtistLookup = () => {
  const [artistId, setArtistId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const lookupArtistId = async (email: string) => {
    setLoading(true);
    setError(null);
    setArtistId(null);

    // 1. Get profile by email
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email.trim())
      .maybeSingle();

    if (profileError || !profile) {
      setError("No user with this email found.");
      setLoading(false);
      return null;
    }

    // 2. Ensure user has artist role
    const { data: artistRole, error: roleError } = await supabase
      .from("user_roles")
      .select("*")
      .eq("user_id", profile.id)
      .eq("role", "artist")
      .single();

    if (roleError || !artistRole) {
      setError("User is not an artist.");
      setLoading(false);
      return null;
    }

    setArtistId(profile.id);
    setLoading(false);
    return profile.id as string;
  };

  return { artistId, error, loading, lookupArtistId };
};
