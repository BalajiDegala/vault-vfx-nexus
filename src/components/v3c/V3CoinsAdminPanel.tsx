
import React, { useState } from "react";
import { useUserSearch } from "@/hooks/useUserSearch";
import { useV3Coins } from "@/hooks/useV3Coins";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Coins, Plus } from "lucide-react";

export function V3CoinsAdminPanel({ adminUserId }: { adminUserId: string }) {
  const [recipientSearch, setRecipientSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserInfo, setSelectedUserInfo] = useState<{ username: string; email: string } | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [amount, setAmount] = useState("");
  const [transactionType, setTransactionType] = useState<"earn" | "purchase">("earn");
  const [reason, setReason] = useState("");
  const [processing, setProcessing] = useState(false);

  const { results, loading } = useUserSearch(recipientSearch);
  const { addTransaction } = useV3Coins(selectedUserId || undefined);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setRecipientSearch(e.target.value);
    setShowDropdown(true);
    setSelectedUserId(null);
    setSelectedUserInfo(null);
  }

  function handleSelectUser(profile: { id: string; username: string | null; email: string; avatar_url: string | null }) {
    setSelectedUserId(profile.id);
    setSelectedUserInfo({ username: profile.username || "", email: profile.email });
    setRecipientSearch(profile.username || profile.email || "");
    setShowDropdown(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !amount || !reason) return;
    
    setProcessing(true);
    const { addTransaction: userAddTransaction } = useV3Coins(selectedUserId);
    
    await userAddTransaction({
      amount: Number(amount),
      type: transactionType,
      metadata: { 
        reason,
        addedBy: adminUserId,
        source: "admin_panel"
      }
    });
    
    setProcessing(false);
    setAmount("");
    setReason("");
    setSelectedUserId(null);
    setSelectedUserInfo(null);
    setRecipientSearch("");
  };

  return (
    <Card className="bg-gray-900/90 border-blue-700/20 w-full max-w-2xl">
      <CardHeader className="flex flex-row items-center gap-3">
        <Plus className="w-6 h-6 text-green-400" />
        <CardTitle className="text-xl text-green-400">Add V3 Coins to User</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User Search */}
          <div className="relative">
            <Label className="block text-gray-300 mb-1">Search User</Label>
            <Input
              placeholder="Search by username or email"
              value={recipientSearch}
              onChange={handleInputChange}
              required
              className="bg-gray-800/40"
              onFocus={() => recipientSearch.length > 0 && setShowDropdown(true)}
            />
            
            {/* Selected User Display */}
            {selectedUserInfo && (
              <div className="mt-2 p-2 bg-green-900/20 border border-green-700/30 rounded text-sm text-green-300">
                Selected: {selectedUserInfo.username || selectedUserInfo.email}
              </div>
            )}

            {/* Autocomplete dropdown */}
            {showDropdown && recipientSearch.length > 1 && (
              <div className="absolute z-30 mt-1 w-full bg-gray-800 border border-blue-700 rounded-md shadow-lg max-h-60 overflow-auto">
                {loading && (
                  <div className="p-2 text-gray-400 text-sm">Searching...</div>
                )}
                {!loading && results.length === 0 && (
                  <div className="p-2 text-gray-300 text-sm">No users found.</div>
                )}
                {!loading &&
                  results.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      className="flex items-center w-full px-3 py-2 text-left hover:bg-blue-900/70 focus:outline-none transition"
                      onClick={() => handleSelectUser(user)}
                    >
                      <Avatar className="h-7 w-7 mr-2">
                        {user.avatar_url ? (
                          <AvatarImage src={user.avatar_url} alt={user.username ?? user.email} />
                        ) : (
                          <AvatarFallback>
                            {(user.first_name?.[0] || user.username?.[0] || user.email[0] || "?").toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex flex-col justify-center">
                        <span className="font-semibold text-gray-100">{user.username || "No Username"}</span>
                        <span className="text-xs text-gray-400">{user.email}</span>
                      </div>
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Amount */}
          <div>
            <Label className="block text-gray-300 mb-1">Amount (V3C)</Label>
            <Input
              placeholder="Enter amount"
              type="number"
              min={1}
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
              className="bg-gray-800/40"
            />
          </div>

          {/* Transaction Type */}
          <div>
            <Label className="block text-gray-300 mb-1">Transaction Type</Label>
            <Select value={transactionType} onValueChange={(value: "earn" | "purchase") => setTransactionType(value)}>
              <SelectTrigger className="bg-gray-800/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="earn">Earn (Bonus/Reward)</SelectItem>
                <SelectItem value="purchase">Purchase Credit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reason */}
          <div>
            <Label className="block text-gray-300 mb-1">Reason</Label>
            <Textarea
              placeholder="Why are you adding these coins? (e.g., bonus, compensation, testing)"
              value={reason}
              onChange={e => setReason(e.target.value)}
              required
              className="bg-gray-800/40"
              rows={3}
            />
          </div>

          <Button
            type="submit"
            disabled={processing || !selectedUserId || !amount || !reason}
            className="w-full"
          >
            {processing ? "Adding..." : `Add ${amount || "0"} V3C`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default V3CoinsAdminPanel;
