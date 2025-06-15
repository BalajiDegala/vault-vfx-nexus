
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UserSearchDropdown from "./UserSearchDropdown";
import V3CAdminFormEnhanced from "./V3CAdminFormEnhanced";
import { Coins } from "lucide-react";

export function V3CoinsAdminPanel({ adminUserId }: { adminUserId: string }) {
  const [recipientSearch, setRecipientSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    display: string;
    currentBalance?: number;
  } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUserSelect = async (profile: {
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
    
    // Fetch current balance for the selected user
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data } = await supabase
        .from("profiles")
        .select("v3_coins_balance")
        .eq("id", profile.id)
        .single();
      
      setSelectedUser({ 
        id: profile.id, 
        display,
        currentBalance: data?.v3_coins_balance || 0
      });
    } catch (error) {
      console.error("Error fetching user balance:", error);
      setSelectedUser({ id: profile.id, display });
    }
    
    setRecipientSearch(display);
    setShowDropdown(false);
  };

  const handleTransactionComplete = () => {
    // Force refresh by incrementing key
    setRefreshKey(prev => prev + 1);
    
    // Trigger refresh events for other components
    window.dispatchEvent(new CustomEvent('v3c-admin-transaction-complete', { 
      detail: { 
        userId: selectedUser?.id,
        adminId: adminUserId,
        timestamp: Date.now()
      } 
    }));
  };

  return (
    <Card className="bg-gray-900/80 border-blue-500/20 mb-8" key={refreshKey}>
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Coins className="h-5 w-5 text-yellow-400" />
          Admin V3C Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="block text-gray-300 mb-2 font-medium">Select User:</label>
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
        
        <V3CAdminFormEnhanced
          adminUserId={adminUserId}
          selectedUser={selectedUser}
          onSelectUser={setSelectedUser}
          onTransactionComplete={handleTransactionComplete}
        />
      </CardContent>
    </Card>
  );
}

export default V3CoinsAdminPanel;
