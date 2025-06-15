
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UserProfileLite {
  id: string;
  display: string;
}

interface V3CAdminFormProps {
  adminUserId: string;
  selectedUser: UserProfileLite | null;
  onSelectUser: (user: UserProfileLite | null) => void;
  onTransactionComplete?: () => void;
}

const V3CAdminForm: React.FC<V3CAdminFormProps> = ({ 
  adminUserId, 
  selectedUser, 
  onSelectUser,
  onTransactionComplete 
}) => {
  const [amount, setAmount] = useState("");
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const resetForm = () => {
    setAmount("");
    onSelectUser(null);
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

    try {
      console.log(`=== ADMIN TRANSACTION START ===`);
      console.log(`Admin: ${adminUserId}`);
      console.log(`Target User: ${selectedUser.id} (${selectedUser.display})`);
      console.log(`Action: ${type}`);
      console.log(`Amount: ${amountNum} V3C`);
      
      // Get current balance first
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("v3_coins_balance")
        .eq("id", selectedUser.id)
        .single();

      if (profileError) {
        console.error("Failed to get current balance:", profileError);
        throw profileError;
      }

      const currentBalance = profileData?.v3_coins_balance || 0;
      console.log(`Current balance: ${currentBalance} V3C`);
      
      const { error } = await (supabase as any).rpc("process_v3c_transaction", {
        p_user_id: selectedUser.id,
        p_amount: amountNum,
        p_type: type,
        p_metadata: {
          admin_action: true,
          admin_id: adminUserId,
          reason: type === "earn" ? "Admin allocation" : "Admin deduction",
          admin_added: type === "earn",
          previous_balance: currentBalance
        }
      });

      if (error) {
        console.error("Transaction RPC error:", error);
        toast({
          title: "Transaction failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        const newBalance = type === "earn" ? currentBalance + amountNum : currentBalance - amountNum;
        console.log(`Expected new balance: ${newBalance} V3C`);
        console.log("=== ADMIN TRANSACTION SUCCESS ===");
        
        toast({
          title: "V3C Transaction",
          description: `Successfully ${type === "earn" ? "added" : "removed"} ${amount} V3C ${type === "earn" ? "to" : "from"} ${selectedUser.display}`
        });
        
        // Trigger comprehensive refresh
        if (onTransactionComplete) {
          onTransactionComplete();
        }
        
        // Fire multiple refresh events to ensure all components update
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('v3c-transaction-complete', { 
            detail: { userId: selectedUser.id, amount: amountNum, type } 
          }));
          window.dispatchEvent(new CustomEvent('v3c-force-refresh', { 
            detail: { userId: selectedUser.id } 
          }));
          window.dispatchEvent(new CustomEvent('admin-v3c-update', { 
            detail: { userId: selectedUser.id, adminId: adminUserId } 
          }));
          
          // Force localStorage event for cross-component communication
          localStorage.setItem('v3c-last-update', JSON.stringify({
            timestamp: Date.now(),
            userId: selectedUser.id,
            adminId: adminUserId,
            action: type,
            amount: amountNum
          }));
        }, 100);
        
        resetForm();
        console.log("=== ADMIN TRANSACTION COMPLETE ===");
      }
    } catch (err) {
      console.error("Unexpected transaction error:", err);
      toast({
        title: "Transaction failed",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
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
          onClick={() => performTransaction("earn")}
          disabled={processing || !selectedUser?.id || !amount || isNaN(Number(amount)) || Number(amount) < 1}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          <Plus className="h-4 w-4 mr-1" />
          {processing ? "Adding..." : "Add V3C"}
        </Button>
        <Button
          onClick={() => performTransaction("spend")}
          disabled={processing || !selectedUser?.id || !amount || isNaN(Number(amount)) || Number(amount) < 1}
          className="flex-1 bg-red-600 hover:bg-red-700"
        >
          <Minus className="h-4 w-4 mr-1" />
          {processing ? "Removing..." : "Remove V3C"}
        </Button>
      </div>
      {selectedUser && (
        <div className="text-sm text-gray-400 bg-gray-800/30 p-2 rounded">
          Selected user: <span className="text-white font-medium">{selectedUser.display}</span>
        </div>
      )}
    </div>
  );
};

export default V3CAdminForm;
