
import React from "react";
import { useV3Coins } from "@/hooks/useV3Coins";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Loader2, Coins, RefreshCw } from "lucide-react";

// Receives userId (required)
export function V3CoinsWallet({ userId }: { userId: string }) {
  const { balance, transactions, loading, fetchTransactions, fetchBalance } = useV3Coins(userId);
  const [showTx, setShowTx] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchBalance(), fetchTransactions()]);
    setRefreshing(false);
  };

  return (
    <Card className="bg-gray-900/90 border-blue-700/20 mb-6 w-full max-w-xl">
      <CardHeader className="flex flex-row items-center gap-3">
        <Coins className="w-7 h-7 text-yellow-400" />
        <div className="flex-1">
          <p className="text-xl font-bold text-yellow-400">V3C Wallet</p>
          <span className="text-gray-400">Current Balance:</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-yellow-300">{balance ?? "--"} V3C</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Button variant="outline" size="sm" onClick={() => setShowTx((v) => !v)}>
          {showTx ? "Hide" : "Show"} Transactions
        </Button>
        {showTx && (
          <div className="mt-4 max-h-48 overflow-y-auto">
            {loading ? (
              <div className="flex items-center">
                <Loader2 className="animate-spin h-5 w-5 mr-2" /> Loading...
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-gray-500">No transactions found.</div>
            ) : (
              <table className="w-full text-sm text-gray-300">
                <thead>
                  <tr>
                    <th className="text-left px-1 py-0.5">Type</th>
                    <th className="text-right px-1 py-0.5">Amount</th>
                    <th className="text-left px-1 py-0.5">When</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(tx => (
                    <tr key={tx.id} className="border-t border-gray-800">
                      <td>{tx.type}</td>
                      <td className="text-right">
                        {tx.type === "earn" || tx.type === "donate" ? "+" : "-"}
                        {tx.amount} V3C
                      </td>
                      <td>{new Date(tx.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default V3CoinsWallet;
