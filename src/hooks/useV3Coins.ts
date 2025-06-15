
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

  // Fetch balance from profile with timestamp to prevent caching
  const fetchBalance = useCallback(async () => {
    if (!userId) return;
    console.log("Fetching balance for user:", userId, "at", new Date().toISOString());
    
    // Add timestamp to prevent caching
    const { data, error } = await supabase
      .from("profiles")
      .select("v3_coins_balance")
      .eq("id", userId)
      .maybeSingle();
      
    if (error) {
      console.error("Balance fetch error:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    
    const newBalance = data?.v3_coins_balance ?? 0;
    console.log("Fresh balance data:", data, "New balance:", newBalance, "Previous balance:", balance);
    
    // Force update even if the same value to ensure UI refreshes
    setBalance(newBalance);
  }, [userId, toast]);

  // Fetch transaction history with timestamp
  const fetchTransactions = useCallback(async () => {
    if (!userId) return;
    console.log("Fetching transactions for user:", userId, "at", new Date().toISOString());
    setLoading(true);
    
    const { data, error } = await (supabase as any)
      .from("v3c_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
      
    if (error) {
      console.error("Transactions fetch error:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    
    console.log("Fresh transactions data:", data);
    setTransactions((data as V3CTransactionRow[]) || []);
    setLoading(false);
  }, [userId, toast]);

  // Force refresh both balance and transactions
  const forceRefresh = useCallback(async () => {
    console.log("=== FORCE REFRESH TRIGGERED ===");
    if (!userId) return;
    
    // Clear current data first to force UI update
    setBalance(null);
    setTransactions([]);
    
    // Wait a bit then fetch fresh data
    setTimeout(async () => {
      await Promise.all([fetchBalance(), fetchTransactions()]);
      console.log("=== FORCE REFRESH COMPLETED ===");
    }, 100);
  }, [userId, fetchBalance, fetchTransactions]);

  useEffect(() => {
    if (userId) {
      console.log("Initial data fetch for user:", userId);
      fetchBalance();
      fetchTransactions();
    }
  }, [fetchBalance, fetchTransactions, userId]);

  // Listen for custom events to refresh data
  useEffect(() => {
    const handleRefresh = () => {
      console.log("Custom event refresh triggered");
      forceRefresh();
    };

    const handleStorageChange = () => {
      console.log("Storage change detected, refreshing data");
      forceRefresh();
    };

    window.addEventListener('v3c-transaction-complete', handleRefresh);
    window.addEventListener('v3c-force-refresh', handleRefresh);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('v3c-transaction-complete', handleRefresh);
      window.removeEventListener('v3c-force-refresh', handleRefresh);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [forceRefresh]);

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
      await forceRefresh();
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
    await forceRefresh();
    return { ok: true };
  };

  return { 
    balance, 
    transactions, 
    loading, 
    fetchBalance, 
    fetchTransactions, 
    forceRefresh,
    sendCoins, 
    addTransaction 
  };
}
