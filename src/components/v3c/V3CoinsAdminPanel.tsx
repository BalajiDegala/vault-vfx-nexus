
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserSearch } from "@/hooks/useUserSearch";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Coins, Plus, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function V3CoinsAdminPanel({ adminUserId }: { adminUserId: string }) {
  const [recipientSearch, setRecipientSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserDisplay, setSelectedUserDisplay] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [amount, setAmount] = useState("");
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  // Don't exclude any users - admin should be able to add coins to anyone including themselves
  const { results, loading } = useUserSearch(recipientSearch);

  const performTransaction = async (type: "earn" | "spend") => {
    if (!selectedUserId || !amount) return;
    setProcessing(true);
    
    try {
      const { error } = await (supabase as any).rpc("process_v3c_transaction", {
        p_user_id: selectedUserId,
        p_amount: Number(amount),
        p_type: type,
        p_metadata: { 
          admin_action: true, 
          admin_id: adminUserId,
          reason: type === "earn" ? "Admin allocation" : "Admin deduction"
        },
      });

      if (error) {
        toast({ 
          title: "Transaction failed", 
          description: error.message, 
          variant: "destructive" 
        });
      } else {
        toast({ 
          title: "V3C Transaction", 
          description: `Successfully ${type === "earn" ? "added" : "removed"} ${amount} V3C ${type === "earn" ? "to" : "from"} ${selectedUserDisplay}` 
        });
        
        // Reset form
        setAmount("");
        setSelectedUserId(null);
        setRecipientSearch("");
        setSelectedUserDisplay("");
      }
    } catch (error) {
      console.error("Transaction error:", error);
      toast({ 
        title: "Transaction failed", 
        description: "An unexpected error occurred", 
        variant: "destructive" 
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleAddCoins = async () => {
    await performTransaction("earn");
  };

  const handleRemoveCoins = async () => {
    await performTransaction("spend");
  };

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setRecipientSearch(value);
    setShowDropdown(true);
    setSelectedUserId(null);
    setSelectedUserDisplay("");
  }

  function handleSelectUser(profile: { 
    id: string; 
    username: string | null; 
    email: string; 
    avatar_url: string | null;
    first_name: string | null;
    last_name: string | null;
  }) {
    setSelectedUserId(profile.id);
    const displayName = profile.username || 
                       `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 
                       profile.email;
    setSelectedUserDisplay(displayName);
    setRecipientSearch(displayName);
    setShowDropdown(false);
  }

  const getDisplayName = (profile: typeof results[0]) => {
    if (profile.first_name || profile.last_name) {
      return `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    }
    return profile.username || profile.email;
  };

  const getInitials = (profile: typeof results[0]) => {
    const name = getDisplayName(profile);
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
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
        <div className="relative">
          <Label className="block text-gray-300 mb-2">Select User:</Label>
          <Input
            placeholder="Search by name, username, or email..."
            value={recipientSearch}
            onChange={handleInputChange}
            className="bg-gray-800/40 text-white"
            autoComplete="off"
            onFocus={() => recipientSearch.length > 0 && setShowDropdown(true)}
          />
          
          {/* User Search Dropdown */}
          {showDropdown && recipientSearch.length > 0 && (
            <div className="absolute z-30 mt-1 w-full bg-gray-800 border border-blue-700 rounded-md shadow-lg max-h-60 overflow-auto">
              {loading && (
                <div className="p-3 text-gray-400 text-sm">Searching users...</div>
              )}
              {!loading && results.length === 0 && (
                <div className="p-3 text-gray-300 text-sm">
                  No users found. Try a different search term.
                </div>
              )}
              {!loading &&
                results.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    className="flex items-center w-full px-3 py-3 text-left hover:bg-blue-900/70 focus:outline-none transition border-b border-gray-700 last:border-b-0"
                    onClick={() => handleSelectUser(user)}
                  >
                    <Avatar className="h-8 w-8 mr-3">
                      {user.avatar_url ? (
                        <AvatarImage src={user.avatar_url} alt={getDisplayName(user)} />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                          {getInitials(user)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex flex-col justify-center min-w-0 flex-1">
                      <span className="font-semibold text-gray-100 truncate">
                        {getDisplayName(user)}
                      </span>
                      {user.username && (
                        <span className="text-xs text-blue-400">@{user.username}</span>
                      )}
                      <span className="text-xs text-gray-400 truncate">{user.email}</span>
                    </div>
                  </button>
                ))}
            </div>
          )}
        </div>

        <div>
          <Label className="block text-gray-300 mb-2">Amount:</Label>
          <Input
            placeholder="Enter V3C amount"
            type="number"
            min={1}
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="bg-gray-800/40 text-white"
          />
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleAddCoins}
            disabled={processing || !selectedUserId || !amount || isNaN(Number(amount)) || Number(amount) < 1}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            {processing ? "Adding..." : "Add V3C"}
          </Button>
          <Button
            onClick={handleRemoveCoins}
            disabled={processing || !selectedUserId || !amount || isNaN(Number(amount)) || Number(amount) < 1}
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            <Minus className="h-4 w-4 mr-1" />
            {processing ? "Removing..." : "Remove V3C"}
          </Button>
        </div>

        {selectedUserId && selectedUserDisplay && (
          <div className="text-sm text-gray-400 bg-gray-800/30 p-2 rounded">
            Selected user: <span className="text-white font-medium">{selectedUserDisplay}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default V3CoinsAdminPanel;
