
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type V3CTransactionType = "earn" | "spend" | "donate" | "purchase" | "project_payment";

export interface V3CTransaction {
  id: string;
  user_id: string;
  type: V3CTransactionType | string;
  amount: number;
  related_user_id?: string | null;
  project_id?: string | null;
  metadata?: any;
  created_at: string;
}

// TypeScript workaround for Supabase types not containing v3c_transactions or new RPC
type V3CTransactionRow = V3CTransaction;

export function useV3Coins(userId?: string) {
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<V3CTransactionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch balance from profile
  const fetchBalance = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from("profiles")
      .select("v3_coins_balance")
      .eq("id", userId)
      .maybeSingle();
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setBalance(data?.v3_coins_balance ?? 0);
  }, [userId, toast]);

  // Fetch transaction history
  const fetchTransactions = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    // @ts-expect-error: v3c_transactions not in generated types yet
    const { data, error } = await (supabase as any)
      .from("v3c_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    // Defensive parse as V3CTransactionRow[]
    setTransactions((data as V3CTransactionRow[]) || []);
    setLoading(false);
  }, [userId, toast]);

  useEffect(() => {
    fetchBalance();
    fetchTransactions();
  }, [fetchBalance, fetchTransactions]);

  // Send/donate coins to another user
  const sendCoins = async ({
    toUserId,
    amount,
    type = "donate",
    metadata
  }: {
    toUserId: string;
    amount: number;
    type?: V3CTransactionType;
    metadata?: any;
  }) => {
    if (!userId) return { error: "Not authenticated" };
    if (amount <= 0) return { error: "Amount must be positive." };
    if (!toUserId || toUserId === userId) return { error: "Invalid recipient" };

    // @ts-expect-error: process_v3c_donation not in generated types yet
    const { data, error } = await (supabase as any).rpc("process_v3c_donation", {
      sender_id: userId,
      receiver_id: toUserId,
      v3c_amount: amount,
      tx_type: type,
      meta: metadata ?? {},
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return { error: error.message };
    } else {
      toast({ title: "V3C Sent!", description: "Transaction successful." });
      await fetchBalance();
      await fetchTransactions();
      return { data };
    }
  };

  // Utility function for earning/spending coins on current user (not transfer)
  const addTransaction = async ({
    amount,
    type,
    metadata,
  }: {
    amount: number;
    type: V3CTransactionType;
    metadata?: any;
  }) => {
    if (!userId) return { error: "Not authenticated" };
    if (amount <= 0) return { error: "Amount must be positive." };

    // @ts-expect-error: process_v3c_transaction not in generated types yet
    const { error } = await (supabase as any).rpc("process_v3c_transaction", {
      p_user_id: userId,
      p_amount: amount,
      p_type: type,
      p_metadata: metadata ?? {},
    });
    if (error) {
      toast({ title: "Transaction failed", description: error.message, variant: "destructive" });
      return { error: error.message };
    }
    toast({ title: "V3C Transaction", description: "Balance updated." });
    await fetchBalance();
    await fetchTransactions();
    return { ok: true };
  };

  return { balance, transactions, loading, fetchBalance, fetchTransactions, sendCoins, addTransaction };
}
