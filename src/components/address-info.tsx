"use client";

import { useBalance } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { formatEther, type Address } from "viem";
import { formatNumber } from "@/lib/format";
import { config } from "@/lib/wagmi";
import { getTransactionCount } from "wagmi/actions";
import { Card } from "@/components/ui/card";

interface AddressInfoProps {
  address: string;
}

export function AddressInfo({ address }: AddressInfoProps) {
  const { data: balanceData, isLoading: isBalanceLoading } = useBalance({
    address: address as Address,
  });

  const { data: txCount, isLoading: isTxCountLoading } = useQuery({
    queryKey: ["transactionCount", address],
    queryFn: async () => {
      return await getTransactionCount(config, {
        address: address as Address,
      });
    },
  });

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="p-6">
        <div className="space-y-1.5">
          <div className="text-sm font-medium text-muted-foreground">
            Balance
          </div>
          {isBalanceLoading ? (
            <div className="text-2xl font-bold animate-pulse">Loading...</div>
          ) : (
            <div className="text-2xl font-bold">
              {balanceData
                ? `${formatNumber(Number.parseFloat(formatEther(balanceData.value)), 4)} ${balanceData.symbol}`
                : "—"}
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-1.5">
          <div className="text-sm font-medium text-muted-foreground">
            Transactions
          </div>
          {isTxCountLoading ? (
            <div className="text-2xl font-bold animate-pulse">Loading...</div>
          ) : (
            <div className="text-2xl font-bold">
              {txCount !== undefined ? formatNumber(txCount, 0) : "—"}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
