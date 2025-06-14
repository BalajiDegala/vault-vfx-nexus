
import React, { useState } from "react";
import { useV3Coins } from "@/hooks/useV3Coins";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUserSearch } from "@/hooks/useUserSearch";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export function V3CoinsSendForm({ userId }: { userId: string }) {
  const { sendCoins } = useV3Coins(userId);
  const [recipientSearch, setRecipientSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const [amount, setAmount] = useState("");
  const [sending, setSending] = useState(false);
  const { results, loading } = useUserSearch(recipientSearch, userId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !amount) return;
    setSending(true);
    await sendCoins({ toUserId: selectedUserId, amount: Number(amount), type: "donate" });
    setSending(false);
    setAmount("");
    setSelectedUserId(null);
    setRecipientSearch("");
  };

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setRecipientSearch(e.target.value);
    setShowDropdown(true);
    setSelectedUserId(null);
  }

  function handleSelectUser(profile: { id: string; username: string | null; email: string; avatar_url: string | null }) {
    setSelectedUserId(profile.id);
    setRecipientSearch(profile.username || profile.email || "");
    setShowDropdown(false);
  }

  return (
    <form
      className="p-4 bg-gray-900/70 rounded-lg border border-blue-800/20 w-full max-w-xl mb-8 relative"
      onSubmit={handleSubmit}
      autoComplete="off"
    >
      <Label className="block text-gray-300 mb-1">Send V3C to another user:</Label>
      <div className="flex gap-2 items-end">
        <div className="relative w-full">
          <Input
            placeholder="Recipient username or email"
            value={recipientSearch}
            onChange={handleInputChange}
            required
            className="bg-gray-800/40 pr-12"
            autoComplete="off"
            onFocus={() => recipientSearch.length > 0 && setShowDropdown(true)}
          />
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
        <Input
          placeholder="Amount"
          type="number"
          min={1}
          value={amount}
          onChange={e => setAmount(e.target.value)}
          required
          className="bg-gray-800/40 w-28"
        />
        <Button
          type="submit"
          disabled={
            sending || !selectedUserId || !amount || isNaN(Number(amount)) || Number(amount) < 1
          }
        >
          {sending ? "Sending..." : "Send"}
        </Button>
      </div>
    </form>
  );
}

export default V3CoinsSendForm;

