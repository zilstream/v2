"use client";

import { useAccount } from "wagmi";
import { Wallet } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConnectWalletButton } from "@/components/connect-button";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";

export default function DashboardPage() {
  const { isConnected, address } = useAccount();

  if (!isConnected || !address) {
    return (
      <div className="flex w-full flex-col items-center justify-center gap-6 p-6 min-h-[60vh]">
        <Card className="max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Wallet className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              Connect your wallet to view your portfolio, token balances,
              staking positions, and liquidity holdings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ConnectWalletButton />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <main className="flex w-full flex-col gap-4 p-3 md:gap-6 md:p-6">
      <DashboardOverview address={address} />
    </main>
  );
}
