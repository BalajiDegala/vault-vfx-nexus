
import React, { useState } from "react";
import { useV3CoinsEnhanced } from "@/hooks/useV3CoinsEnhanced";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUserSearch } from "@/hooks/useUserSearch";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Loader2 } from "lucide-react";

export function V3CoinsSendForm({ userId }: { userId: string }) {
  const { sendCoins, balance } = useV3CoinsEnhanced(userId);
  const [recipientSearch, setRecipientSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [amount, setAmount] = useState("");
  const [sending, setSending] = useState(false);
  const { searchResults, loading, searchUsers } = useUserSearch("", userId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !amount) return;
    
    setSending(true);
    const result = await sendCoins({ 
      toUserId: selectedUserId, 
      amount: Number(amount), 
      type: "donate" 
    });
    
    if (result.success) {
      setAmount("");
      setSelectedUserId(null);
      setRecipientSearch("");
    }
    setSending(false);
  };

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setRecipientSearch(value);
    setShowDropdown(true);
    setSelectedUserId(null);
    if (value.length > 0) {
      searchUsers(value);
    }
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
      `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || 
      profile.email;
    setRecipientSearch(displayName);
    setShowDropdown(false);
  }

  const amountNum = Number(amount);
  const canSend = selectedUserId && amountNum > 0 && (balance || 0) >= amountNum;

  return (
    <Card className="bg-gray-900/70 border-blue-800/20 w-full max-w-xl mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-300">
          <Send className="h-5 w-5" />
          Send V3C
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
          <div className="relative">
            <Label className="block text-gray-300 mb-2">Recipient:</Label>
            <Input
              placeholder="Search username or email"
              value={recipientSearch}
              onChange={handleInputChange}
              required
              className="bg-gray-800/40"
              autoComplete="off"
              onFocus={() => recipientSearch.length > 0 && setShowDropdown(true)}
              disabled={sending}
            />
            
            {/* Autocomplete dropdown */}
            {showDropdown && recipientSearch.length > 1 && (
              <div className="absolute z-30 mt-1 w-full bg-gray-800 border border-blue-700 rounded-md shadow-lg max-h-60 overflow-auto">
                {loading && (
                  <div className="p-3 text-gray-400 text-sm flex items-center">
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Searching...
                  </div>
                )}
                {!loading && searchResults.length === 0 && (
                  <div className="p-3 text-gray-300 text-sm">No users found.</div>
                )}
                {!loading &&
                  searchResults.map((user) => (
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
                        <span className="font-semibold text-gray-100">
                          {user.username || `${user.first_name || ""} ${user.last_name || ""}`.trim() || "No Username"}
                        </span>
                        <span className="text-xs text-gray-400">{user.email}</span>
                      </div>
                    </button>
                  ))}
              </div>
            )}
          </div>
          
          <div>
            <Label className="block text-gray-300 mb-2">Amount (V3C):</Label>
            <Input
              placeholder="Enter amount"
              type="number"
              min={1}
              step="1"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
              className="bg-gray-800/40"
              disabled={sending}
            />
            {balance !== null && (
              <div className="text-xs text-gray-400 mt-1">
                Available balance: {balance} V3C
              </div>
            )}
          </div>
          
          <Button
            type="submit"
            disabled={!canSend || sending}
            className="w-full"
          >
            {sending ? (
              <>
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send {amount && `${amount} `}V3C
              </>
            )}
          </Button>
          
          {!canSend && selectedUserId && amountNum > 0 && (balance || 0) < amountNum && (
            <div className="text-red-400 text-sm">
              Insufficient balance. You need {amountNum - (balance || 0)} more V3C.
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

export default V3CoinsSendForm;
