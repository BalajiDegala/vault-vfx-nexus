
import logger from "@/lib/logger";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Minus, User, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { V3CTransactionResult } from "@/hooks/useV3CoinsEnhanced";

interface UserProfileLite {
  id: string;
  display: string;
  currentBalance?: number;
}

interface V3CAdminFormEnhancedProps {
  adminUserId: string;
  selectedUser: UserProfileLite | null;
  onSelectUser: (user: UserProfileLite | null) => void;
  onTransactionComplete?: () => void;
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

const V3CAdminFormEnhanced: React.FC<V3CAdminFormEnhancedProps> = ({ 
  adminUserId, 
  selectedUser, 
  onSelectUser,
  onTransactionComplete 
}) => {
  const [amount, setAmount] = useState("");
  const [processing, setProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<V3CTransactionResult | null>(null);
  const { toast } = useToast();

  const resetForm = () => {
    setAmount("");
    onSelectUser(null);
    setLastResult(null);
  };

  const fetchUserBalance = async (userId: string): Promise<number> => {
    const { data, error } = await supabase
      .from("profiles")
      .select("v3_coins_balance")
      .eq("id", userId)
      .single();
    
    if (error) throw error;
    return data?.v3_coins_balance || 0;
  };

  const performTransaction = async (type: "earn" | "spend") => {
    if (!selectedUser || !amount) return;
    
    const amountNum = Number(amount);
    if (amountNum <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Amount must be greater than 0",
        variant: "destructive"
      });
      return;
    }

    setProcessing(true);
    setLastResult(null);

    try {
      logger.log(`=== ADMIN TRANSACTION START ===`);
      logger.log(`Admin: ${adminUserId}`);
      logger.log(`Target User: ${selectedUser.id} (${selectedUser.display})`);
      logger.log(`Action: ${type}`);
      logger.log(`Amount: ${amountNum} V3C`);
      
      // Get current balance first
      const currentBalance = await fetchUserBalance(selectedUser.id);
      logger.log(`Current balance: ${currentBalance} V3C`);
      
      // Process transaction using enhanced function
      const { data, error } = await supabase.rpc("process_v3c_transaction", {
        p_user_id: selectedUser.id,
        p_amount: amountNum,
        p_type: type,
        p_metadata: {
          admin_action: true,
          admin_id: adminUserId,
          reason: type === "earn" ? "Admin allocation" : "Admin deduction",
          previous_balance: currentBalance
        }
      });

      if (error) {
        logger.error("Transaction RPC error:", error);
        setLastResult({ success: false, error: error.message });
        toast({
          title: "Transaction failed",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      const result = convertToTransactionResult(data);
      setLastResult(result);

      if (!result.success) {
        logger.error("Transaction failed:", result.error);
        toast({
          title: "Transaction failed",
          description: result.error,
          variant: "destructive"
        });
        return;
      }

      logger.log("=== ADMIN TRANSACTION SUCCESS ===");
      logger.log("Result:", result);
      
      toast({
        title: "V3C Transaction Successful",
        description: `Successfully ${type === "earn" ? "added" : "removed"} ${amount} V3C ${type === "earn" ? "to" : "from"} ${selectedUser.display}. New balance: ${result.new_balance} V3C`
      });
      
      // Update selected user with new balance
      if (result.new_balance !== undefined) {
        onSelectUser({
          ...selectedUser,
          currentBalance: result.new_balance
        });
      }
      
      // Trigger refresh
      if (onTransactionComplete) {
        onTransactionComplete();
      }
      
      // Clear form
      setAmount("");
      logger.log("=== ADMIN TRANSACTION COMPLETE ===");
      
    } catch (err) {
      logger.error("Unexpected transaction error:", err);
      const errorMsg = "An unexpected error occurred.";
      setLastResult({ success: false, error: errorMsg });
      toast({
        title: "Transaction failed",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          V3C Transaction
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {selectedUser && (
          <Alert>
            <User className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium">Selected User: {selectedUser.display}</div>
              {selectedUser.currentBalance !== undefined && (
                <div className="text-sm text-gray-600 mt-1">
                  Current Balance: {selectedUser.currentBalance} V3C
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div>
          <Label className="block text-gray-300 mb-2">Amount (V3C):</Label>
          <Input
            placeholder="Enter V3C amount"
            type="number"
            min={1}
            step="1"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="bg-gray-800/40 text-white"
            disabled={processing}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => performTransaction("earn")}
            disabled={processing || !selectedUser?.id || !amount || isNaN(Number(amount)) || Number(amount) < 1}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50"
          >
            <Plus className="h-4 w-4 mr-1" />
            {processing ? "Adding..." : "Add V3C"}
          </Button>
          <Button
            onClick={() => performTransaction("spend")}
            disabled={processing || !selectedUser?.id || !amount || isNaN(Number(amount)) || Number(amount) < 1}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50"
          >
            <Minus className="h-4 w-4 mr-1" />
            {processing ? "Removing..." : "Remove V3C"}
          </Button>
        </div>

        {lastResult && (
          <Alert className={lastResult.success ? "border-green-500" : "border-red-500"}>
            {lastResult.success ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
            <AlertDescription>
              {lastResult.success ? (
                <div>
                  <div className="font-medium text-green-700">Transaction Successful</div>
                  <div className="text-sm mt-1">
                    Previous Balance: {lastResult.previous_balance} V3C<br/>
                    New Balance: {lastResult.new_balance} V3C<br/>
                    Amount {lastResult.type}: {lastResult.amount} V3C
                  </div>
                </div>
              ) : (
                <div>
                  <div className="font-medium text-red-700">Transaction Failed</div>
                  <div className="text-sm mt-1">{lastResult.error}</div>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {processing && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Processing transaction... Please do not close this window.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default V3CAdminFormEnhanced;
