
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UserSearchDropdown from "./UserSearchDropdown";
import V3CAdminForm from "./V3CAdminForm";
import { Coins } from "lucide-react";

export function V3CoinsAdminPanel({ adminUserId }: { adminUserId: string }) {
  const [recipientSearch, setRecipientSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    display: string;
  } | null>(null);

  const handleUserSelect = (profile: {
    id: string;
    username: string | null;
    email: string;
    avatar_url: string | null;
    first_name: string | null;
    last_name: string | null;
  }) => {
    const display =
      profile.username ||
      `${profile.first_name || ""} ${profile.last_name || ""}`.trim() ||
      profile.email;
    setSelectedUser({ id: profile.id, display });
    setRecipientSearch(display);
    setShowDropdown(false);
  };

  return (
    <Card className="bg-gray-900/80 border-blue-500/20 mb-8">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Coins className="h-5 w-5 text-yellow-400" />
          Admin V3C Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-gray-300 mb-2">Select User:</label>
          <UserSearchDropdown
            search={recipientSearch}
            onChange={v => {
              setRecipientSearch(v);
              setSelectedUser(null);
              setShowDropdown(true);
            }}
            onSelect={handleUserSelect}
            showDropdown={showDropdown}
            setShowDropdown={setShowDropdown}
            loadingHint="Searching users..."
          />
        </div>
        <V3CAdminForm
          adminUserId={adminUserId}
          selectedUser={selectedUser}
          onSelectUser={setSelectedUser}
        />
      </CardContent>
    </Card>
  );
}

export default V3CoinsAdminPanel;
