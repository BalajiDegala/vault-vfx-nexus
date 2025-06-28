
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import logger from "@/lib/logger";

interface UserWithRole {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  roles: string[];
}

const TestUsers = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Get all profiles
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("*");

        if (profilesError) {
          logger.error("Error fetching profiles:", profilesError);
          return;
        }

        // Get all user roles
        const { data: userRoles, error: rolesError } = await supabase
          .from("user_roles")
          .select("*");

        if (rolesError) {
          logger.error("Error fetching roles:", rolesError);
          return;
        }

        // Combine profiles with their roles
        const usersWithRoles = profiles?.map(profile => ({
          ...profile,
          roles: userRoles?.filter(role => role.user_id === profile.id).map(role => role.role) || []
        })) || [];

        setUsers(usersWithRoles);
      } catch (error) {
        logger.error("Unexpected error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black flex items-center justify-center">
        <p className="text-gray-400">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black p-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Test Users & Roles</h1>
        
        <div className="grid gap-4">
          {users.map((user) => (
            <Card key={user.id} className="bg-gray-900/80 border-blue-500/20">
              <CardHeader>
                <CardTitle className="text-white">
                  {user.first_name} {user.last_name} (@{user.username})
                </CardTitle>
                <p className="text-gray-400">{user.email}</p>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  {user.roles.length > 0 ? (
                    user.roles.map((role) => (
                      <Badge key={role} variant="secondary" className="bg-blue-500/20 text-blue-400">
                        {role}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="destructive">No roles assigned</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {users.length === 0 && (
          <Card className="bg-gray-900/80 border-blue-500/20">
            <CardContent className="p-8 text-center">
              <p className="text-gray-400 text-lg">No users found. Try creating an account first.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TestUsers;
