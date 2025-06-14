
import React, { useState } from "react";
import { useV3Coins } from "@/hooks/useV3Coins";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function V3CoinsSendForm({ userId }: { userId: string }) {
  const { sendCoins } = useV3Coins(userId);
  const [toUser, setToUser] = useState("");
  const [amount, setAmount] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    await sendCoins({ toUserId: toUser, amount: Number(amount), type: "donate" });
    setSending(false);
    setAmount("");
    setToUser("");
  };

  return (
    <form className="p-4 bg-gray-900/70 rounded-lg border border-blue-800/20 w-full max-w-xl mb-8" onSubmit={handleSubmit}>
      <Label className="block text-gray-300 mb-1">Send V3C to another user:</Label>
      <div className="flex gap-2 items-end">
        <Input
          placeholder="Recipient User ID"
          value={toUser}
          onChange={e => setToUser(e.target.value)}
          required
          className="bg-gray-800/40"
        />
        <Input
          placeholder="Amount"
          type="number"
          min={1}
          value={amount}
          onChange={e => setAmount(e.target.value)}
          required
          className="bg-gray-800/40 w-28"
        />
        <Button type="submit" disabled={sending || !toUser || !amount}>
          {sending ? "Sending..." : "Send"}
        </Button>
      </div>
    </form>
  );
}

export default V3CoinsSendForm;
