
import logger from "@/lib/logger";
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

  // Fetch balance from profile with cache busting
  const fetchBalance = useCallback(async () => {
    if (!userId) return;
    logger.log("=== FETCHING BALANCE ===");
    logger.log("User ID:", userId);
    logger.log("Timestamp:", new Date().toISOString());
    
    // Add random query param to bust cache
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
    logger.log("Raw database response:", data);
    logger.log("Extracted balance:", newBalance);
    logger.log("Previous balance:", balance);
    
    setBalance(newBalance);
    logger.log("=== BALANCE FETCH COMPLETE ===");
  }, [userId, toast]);

  // Fetch transaction history with cache busting
  const fetchTransactions = useCallback(async () => {
    if (!userId) return;
    logger.log("=== FETCHING TRANSACTIONS ===");
    logger.log("User ID:", userId);
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
    
    logger.log("Fresh transactions data:", data);
    setTransactions((data as V3CTransactionRow[]) || []);
    setLoading(false);
    logger.log("=== TRANSACTIONS FETCH COMPLETE ===");
  }, [userId, toast]);

  // Force refresh both balance and transactions
  const forceRefresh = useCallback(async () => {
    logger.log("=== FORCE REFRESH TRIGGERED ===");
    logger.log("User ID:", userId);
    if (!userId) return;
    
    // Clear current data first
    setBalance(null);
    setTransactions([]);
    
    // Small delay to ensure UI updates
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Fetch fresh data
    await Promise.all([fetchBalance(), fetchTransactions()]);
    logger.log("=== FORCE REFRESH COMPLETED ===");
  }, [userId, fetchBalance, fetchTransactions]);

  useEffect(() => {
    if (userId) {
      logger.log("=== INITIAL DATA FETCH ===");
      logger.log("User ID:", userId);
      fetchBalance();
      fetchTransactions();
    }
  }, [fetchBalance, fetchTransactions, userId]);

  // Listen for refresh events
  useEffect(() => {
    const handleRefresh = (event: Event) => {
      logger.log("=== REFRESH EVENT RECEIVED ===");
      logger.log("Event type:", event.type);
      forceRefresh();
    };

    const handleStorageChange = () => {
      logger.log("=== STORAGE CHANGE DETECTED ===");
      forceRefresh();
    };

    // Listen to multiple refresh events
    window.addEventListener('v3c-transaction-complete', handleRefresh);
    window.addEventListener('v3c-force-refresh', handleRefresh);
    window.addEventListener('admin-v3c-update', handleRefresh);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('v3c-transaction-complete', handleRefresh);
      window.removeEventListener('v3c-force-refresh', handleRefresh);
      window.removeEventListener('admin-v3c-update', handleRefresh);
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

    logger.log("=== SENDING COINS ===");
    logger.log("From:", userId, "To:", toUserId, "Amount:", amount);

    const { data, error } = await (supabase as any).rpc("process_v3c_donation", {
      sender_id: userId,
      receiver_id: toUserId,
      v3c_amount: amount,
      tx_type: type,
      meta: metadata ?? {},
    });

    if (error) {
      console.error("Send coins error:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return { error: error.message };
    } else {
      logger.log("Send coins success:", data);
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

    logger.log("=== ADDING TRANSACTION ===");
    logger.log("User:", userId, "Amount:", amount, "Type:", type);

    const { error } = await (supabase as any).rpc("process_v3c_transaction", {
      p_user_id: userId,
      p_amount: amount,
      p_type: type,
      p_metadata: metadata ?? {},
    });
    
    if (error) {
      console.error("Add transaction error:", error);
      toast({ title: "Transaction failed", description: error.message, variant: "destructive" });
      return { error: error.message };
    }
    
    logger.log("Add transaction success");
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
