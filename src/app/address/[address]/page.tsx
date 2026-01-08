"use client";

import { Crown, Wallet } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { useAccount, useReadContract } from "wagmi";
import { AddressEvents } from "@/components/address-events";
import { AddressInfo } from "@/components/address-info";
import { AddressTransactions } from "@/components/address-transactions";
import { ConnectWalletButton } from "@/components/connect-button";
import { CopyButton } from "@/components/copy-button";
import { ExplorerDropdown } from "@/components/explorer-dropdown";
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

export default function AddressPage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address: pageAddress } = use(params);
  const { isConnected, address: connectedAddress } = useAccount();

  const isOwnAddress =
    connectedAddress?.toLowerCase() === pageAddress.toLowerCase();

  const { data: hasActiveMembership, isLoading: isMembershipLoading } =
    useReadContract({
      address: MEMBERSHIP_NFT_ADDRESS,
      abi: MEMBERSHIP_NFT_ABI,
      functionName: "hasActiveMembership",
      args: [connectedAddress ?? "0x0"],
      query: { enabled: !!connectedAddress && isOwnAddress },
    });

  if (isOwnAddress && !isConnected) {
    return (
      <div className="flex w-full flex-col items-center justify-center gap-6 p-6 min-h-[60vh]">
        <Card className="w-full max-w-xl text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Wallet className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              Connect your wallet to view your transaction history and trading
              activity.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ConnectWalletButton />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isOwnAddress && isMembershipLoading) {
    return (
      <div className="flex w-full flex-col items-center justify-center gap-6 p-6 min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isOwnAddress && !hasActiveMembership) {
    return (
      <div className="flex w-full flex-col items-center justify-center gap-6 p-6 min-h-[60vh]">
        <Card className="w-full max-w-xl text-center">
          <CardHeader className="pb-4">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Crown className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-xl">Membership Required</CardTitle>
            <CardDescription className="text-base">
              Your transaction history is a members-only feature. Get a
              ZilStream membership to view your full transaction history,
              trading activity, and token transfers.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-4 text-left">
              <p className="text-sm font-medium mb-2">
                With a membership you get:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Full transaction history and trading activity</li>
                <li>• Portfolio dashboard with token balances</li>
                <li>• Staking and liquidity position tracking</li>
                <li>• Export data for tax reporting</li>
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
    <div className="flex w-full flex-col gap-4 p-3 md:gap-6 md:p-6">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">Address</h1>
            <div className="flex items-center gap-2">
              <p className="font-mono text-sm text-muted-foreground break-all">
                {pageAddress}
              </p>
              <CopyButton text={pageAddress} />
            </div>
          </div>
          <ExplorerDropdown type="address" value={pageAddress} />
        </div>
        <AddressInfo address={pageAddress} />
      </div>

      <AddressEvents address={pageAddress} />

      <AddressTransactions address={pageAddress} />
    </div>
  );
}
