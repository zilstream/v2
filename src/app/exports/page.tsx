"use client";

import { Crown, Wallet } from "lucide-react";
import Link from "next/link";
import { useAccount, useReadContract } from "wagmi";
import { ConnectWalletButton } from "@/components/connect-button";
import { ExportsForm } from "@/components/exports/exports-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MEMBERSHIP_NFT_ABI } from "@/lib/abis";
import { MEMBERSHIP_NFT_ADDRESS } from "@/lib/constants";

export default function ExportsPage() {
  const { isConnected, address } = useAccount();

  const { data: hasActiveMembership, isLoading: isMembershipLoading } =
    useReadContract({
      address: MEMBERSHIP_NFT_ADDRESS,
      abi: MEMBERSHIP_NFT_ABI,
      functionName: "hasActiveMembership",
      args: [address ?? "0x0"],
      query: { enabled: !!address },
    });

  if (!isConnected || !address) {
    return (
      <div className="flex w-full flex-col items-center justify-center gap-6 p-6 min-h-[60vh]">
        <Card className="w-full max-w-xl text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Wallet className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              Connect your wallet to export your trading history, transactions,
              and portfolio data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ConnectWalletButton />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isMembershipLoading) {
    return (
      <div className="flex w-full flex-col items-center justify-center gap-6 p-6 min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!hasActiveMembership) {
    return (
      <div className="flex w-full flex-col items-center justify-center gap-6 p-6 min-h-[60vh]">
        <Card className="w-full max-w-xl text-center">
          <CardHeader className="pb-4">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Crown className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-xl">Membership Required</CardTitle>
            <CardDescription className="text-base">
              Data exports are a members-only feature. Get a ZilStream
              membership to export your data for tax reporting.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-4 text-left">
              <p className="text-sm font-medium mb-2">
                With a membership you get:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Export trading history and transactions</li>
                <li>• Portfolio dashboard with token balances</li>
                <li>• Staking and liquidity position tracking</li>
                <li>• Full transaction history and trading activity</li>
              </ul>
            </div>
            <Button asChild className="w-full" size="lg">
              <Link href="/membership">Get Membership</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <main className="flex w-full flex-col gap-4 p-3 md:gap-6 md:p-6">
      <ExportsForm address={address} />
    </main>
  );
}
