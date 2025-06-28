
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import logger from "@/lib/logger";

type UserForAssignment = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  email: string;
};

export const useProjectUsers = () => {
  const [users, setUsers] = useState<UserForAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, username, email")
          .order("first_name");

        if (!error && data) {
          setUsers(data);
        }
      } catch (error) {
        logger.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const getUserDisplayName = (user: UserForAssignment) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user.username) {
      return user.username;
    }
    return user.email;
  };

  return {
    users,
    loading,
    getUserDisplayName
  };
};
