
import logger from "@/lib/logger";
import React, { useState } from "react";
import { useV3CoinsEnhanced } from "@/hooks/useV3CoinsEnhanced";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Coins, RefreshCw, Wifi, WifiOff, AlertCircle } from "lucide-react";

export function V3CoinsWalletEnhanced({ userId }: { userId: string }) {
  const { 
    balance, 
    transactions, 
    loading, 
    realtimeConnected,
    forceRefresh 
  } = useV3CoinsEnhanced(userId);
  
  const [showTx, setShowTx] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    logger.log("=== MANUAL REFRESH CLICKED ===");
    setRefreshing(true);
    try {
      await forceRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  const formatTransactionType = (type: string) => {
    switch (type) {
      case 'earn': return 'Earned';
      case 'spend': return 'Spent';
      case 'donate': return 'Donated';
      case 'receive': return 'Received';
      case 'bonus': return 'Bonus';
      default: return type;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'earn':
      case 'receive':
      case 'bonus':
        return 'text-green-400';
      case 'spend':
      case 'donate':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getTransactionSign = (type: string) => {
    switch (type) {
      case 'earn':
      case 'receive':
      case 'bonus':
        return '+';
      case 'spend':
      case 'donate':
        return '-';
      default:
        return '';
    }
  };

  return (
    <Card className="bg-gray-900/90 border-blue-700/20 mb-6 w-full max-w-xl">
      <CardHeader className="flex flex-row items-center gap-3">
        <Coins className="w-7 h-7 text-yellow-400" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-xl font-bold text-yellow-400">V3C Wallet</p>
            <Badge variant="outline" className={`text-xs ${realtimeConnected ? 'text-green-400 border-green-400' : 'text-red-400 border-red-400'}`}>
              {realtimeConnected ? (
                <>
                  <Wifi className="w-3 h-3 mr-1" />
                  Live
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 mr-1" />
                  Offline
                </>
              )}
            </Badge>
          </div>
          <span className="text-gray-400">Current Balance:</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-yellow-300">
            {balance !== null ? `${balance} V3C` : "--"}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="h-8 w-8 p-0"
            title="Force refresh balance"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" size="sm" onClick={() => setShowTx((v) => !v)}>
            {showTx ? "Hide" : "Show"} Transactions
          </Button>
          {!realtimeConnected && (
            <div className="flex items-center gap-1 text-amber-400 text-xs">
              <AlertCircle className="w-3 h-3" />
              Real-time updates disabled
            </div>
          )}
        </div>
        
        {showTx && (
          <div className="mt-4 max-h-64 overflow-y-auto border border-gray-700 rounded-lg">
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="animate-spin h-5 w-5 mr-2" /> 
                Loading transactions...
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-gray-500 text-center p-4">No transactions found.</div>
            ) : (
              <div className="divide-y divide-gray-700">
                {transactions.map(tx => (
                  <div key={tx.id} className="p-3 hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-200">
                            {formatTransactionType(tx.type)}
                          </span>
                          {tx.related_user_id && (
                            <Badge variant="secondary" className="text-xs">
                              Transfer
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(tx.created_at).toLocaleString()}
                        </div>
                        {tx.metadata?.previous_balance !== undefined && (
                          <div className="text-xs text-gray-500 mt-1">
                            Balance: {tx.metadata.previous_balance} → {tx.metadata.new_balance} V3C
                          </div>
                        )}
                      </div>
                      <div className={`text-right font-bold ${getTransactionColor(tx.type)}`}>
                        {getTransactionSign(tx.type)}{tx.amount} V3C
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default V3CoinsWalletEnhanced;
