
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RealtimeChannel } from "@supabase/supabase-js";

export type V3CTransactionType = "earn" | "spend" | "donate" | "purchase" | "project_payment" | "receive" | "bonus";

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

export interface V3CTransactionResult {
  success: boolean;
  transaction_id?: string;
  previous_balance?: number;
  new_balance?: number;
  amount?: number;
  type?: string;
  error?: string;
  error_code?: string;
}

// Type guard to validate V3CTransactionResult
function isV3CTransactionResult(data: any): data is V3CTransactionResult {
  return data && typeof data === 'object' && typeof data.success === 'boolean';
}

// Safe conversion from Json to V3CTransactionResult
function convertToTransactionResult(data: any): V3CTransactionResult {
  if (!isV3CTransactionResult(data)) {
    return {
      success: false,
      error: "Invalid response format from database"
    };
  }
  return data;
}

export function useV3CoinsEnhanced(userId?: string) {
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<V3CTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const { toast } = useToast();
  
  const channelRef = useRef<RealtimeChannel | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const subscriptionInitialized = useRef(false);

  // Fetch balance with optimistic locking
  const fetchBalance = useCallback(async (silent = false) => {
    if (!userId) return;
    
    if (!silent) {
      console.log("=== FETCHING BALANCE ===");
      console.log("User ID:", userId);
    }
    
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("v3_coins_balance, updated_at")
        .eq("id", userId)
        .single();
        
      if (error) {
        console.error("Balance fetch error:", error);
        if (!silent) {
          toast({ title: "Error", description: error.message, variant: "destructive" });
        }
        return;
      }
      
      const newBalance = data?.v3_coins_balance ?? 0;
      const updateTime = new Date(data?.updated_at || 0).getTime();
      
      // Only update if this is newer data
      if (updateTime > lastUpdateRef.current) {
        setBalance(newBalance);
        lastUpdateRef.current = updateTime;
        
        if (!silent) {
          console.log("Balance updated:", newBalance);
        }
      }
    } catch (err) {
      console.error("Unexpected error fetching balance:", err);
      if (!silent) {
        toast({ title: "Error", description: "Failed to fetch balance", variant: "destructive" });
      }
    }
  }, [userId, toast]);

  // Fetch transactions
  const fetchTransactions = useCallback(async (silent = false) => {
    if (!userId) return;
    
    if (!silent) {
      console.log("=== FETCHING TRANSACTIONS ===");
      setLoading(true);
    }
    
    try {
      const { data, error } = await supabase
        .from("v3c_transactions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);
        
      if (error) {
        console.error("Transactions fetch error:", error);
        if (!silent) {
          toast({ title: "Error", description: error.message, variant: "destructive" });
        }
        return;
      }
      
      setTransactions((data as V3CTransaction[]) || []);
    } catch (err) {
      console.error("Unexpected error fetching transactions:", err);
      if (!silent) {
        toast({ title: "Error", description: "Failed to fetch transactions", variant: "destructive" });
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [userId, toast]);

  // Setup real-time subscriptions - Fixed to prevent multiple subscriptions
  useEffect(() => {
    if (!userId || subscriptionInitialized.current) return;

    console.log("=== SETTING UP REALTIME SUBSCRIPTIONS ===");
    subscriptionInitialized.current = true;
    
    // Create realtime channel with unique name
    const channelName = `v3c_user_${userId}_${Date.now()}`;
    const channel = supabase.channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`
        },
        (payload) => {
          console.log("Profile balance updated:", payload);
          if (payload.new && 'v3_coins_balance' in payload.new) {
            const newBalance = payload.new.v3_coins_balance as number;
            setBalance(newBalance);
            lastUpdateRef.current = Date.now();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'v3c_transactions',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log("Transaction updated:", payload);
          // Refresh transactions when any change occurs
          fetchTransactions(true);
        }
      )
      .subscribe((status) => {
        console.log("Realtime status:", status);
        setRealtimeConnected(status === 'SUBSCRIBED');
      });

    channelRef.current = channel;

    return () => {
      console.log("=== CLEANING UP REALTIME SUBSCRIPTIONS ===");
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      subscriptionInitialized.current = false;
      setRealtimeConnected(false);
    };
  }, [userId, fetchTransactions]);

  // Initial data fetch
  useEffect(() => {
    if (userId) {
      console.log("=== INITIAL DATA FETCH ===");
      Promise.all([fetchBalance(), fetchTransactions()]);
    }
  }, [userId, fetchBalance, fetchTransactions]);

  // Force refresh function
  const forceRefresh = useCallback(async () => {
    console.log("=== FORCE REFRESH TRIGGERED ===");
    if (!userId) return;
    
    await Promise.all([fetchBalance(), fetchTransactions()]);
  }, [userId, fetchBalance, fetchTransactions]);

  // Process transaction with new enhanced function
  const processTransaction = async ({
    amount,
    type,
    metadata,
  }: {
    amount: number;
    type: V3CTransactionType;
    metadata?: any;
  }): Promise<V3CTransactionResult> => {
    if (!userId) return { success: false, error: "Not authenticated" };
    if (amount <= 0) return { success: false, error: "Amount must be positive." };

    console.log("=== PROCESSING TRANSACTION ===");
    console.log("User:", userId, "Amount:", amount, "Type:", type);

    try {
      const { data, error } = await supabase.rpc("process_v3c_transaction", {
        p_user_id: userId,
        p_amount: amount,
        p_type: type,
        p_metadata: metadata || {},
      });

      if (error) {
        console.error("Transaction RPC error:", error);
        toast({ title: "Transaction failed", description: error.message, variant: "destructive" });
        return { success: false, error: error.message };
      }

      const result = convertToTransactionResult(data);
      
      if (!result.success) {
        toast({ title: "Transaction failed", description: result.error, variant: "destructive" });
        return result;
      }

      console.log("Transaction successful:", result);
      toast({ title: "V3C Transaction", description: `Successfully ${type} ${amount} V3C` });
      
      // Real-time will handle the updates, but we can optimistically update
      if (result.new_balance !== undefined) {
        setBalance(result.new_balance);
      }
      
      return result;
    } catch (err) {
      console.error("Unexpected transaction error:", err);
      const errorMsg = "An unexpected error occurred.";
      toast({ title: "Transaction failed", description: errorMsg, variant: "destructive" });
      return { success: false, error: errorMsg };
    }
  };

  // Send/donate coins with new enhanced function
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
  }): Promise<V3CTransactionResult> => {
    if (!userId) return { success: false, error: "Not authenticated" };
    if (amount <= 0) return { success: false, error: "Amount must be positive." };
    if (!toUserId || toUserId === userId) return { success: false, error: "Invalid recipient" };

    console.log("=== SENDING COINS ===");
    console.log("From:", userId, "To:", toUserId, "Amount:", amount);

    try {
      const { data, error } = await supabase.rpc("process_v3c_donation", {
        sender_id: userId,
        receiver_id: toUserId,
        v3c_amount: amount,
        tx_type: type,
        meta: metadata || {},
      });

      if (error) {
        console.error("Send coins RPC error:", error);
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return { success: false, error: error.message };
      }

      // Handle the donation response which has a different structure
      const result = data as any;
      
      if (!result || typeof result.success !== 'boolean') {
        return { success: false, error: "Invalid response format" };
      }
      
      if (!result.success) {
        toast({ title: "Transaction failed", description: result.error, variant: "destructive" });
        return { success: false, error: result.error };
      }

      console.log("Send coins successful:", result);
      toast({ title: "V3C Sent!", description: `Successfully sent ${amount} V3C` });
      
      // Optimistically update balance
      if (result.sender_new_balance !== undefined) {
        setBalance(result.sender_new_balance);
      }
      
      return { success: true, new_balance: result.sender_new_balance };
    } catch (err) {
      console.error("Unexpected send coins error:", err);
      const errorMsg = "An unexpected error occurred.";
      toast({ title: "Error", description: errorMsg, variant: "destructive" });
      return { success: false, error: errorMsg };
    }
  };

  return { 
    balance, 
    transactions, 
    loading, 
    realtimeConnected,
    fetchBalance, 
    fetchTransactions, 
    forceRefresh,
    sendCoins, 
    processTransaction
  };
}
