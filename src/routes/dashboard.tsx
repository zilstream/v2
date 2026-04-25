import { createFileRoute, Link } from "@tanstack/react-router";
import { Crown, Wallet } from "lucide-react";
import { useAccount, useReadContract } from "wagmi";
import { ConnectWalletButton } from "@/components/connect-button";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
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

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
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
              The portfolio dashboard is a members-only feature. Get a ZilStream
              membership to access your complete portfolio overview.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-4 text-left">
              <p className="text-sm font-medium mb-2">
                With a membership you get:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Portfolio dashboard with token balances</li>
                <li>• Staking and liquidity position tracking</li>
                <li>• Full transaction history and trading activity</li>
                <li>• Export data for tax reporting</li>
              </ul>
            </div>
            <Button asChild className="w-full" size="lg">
              <Link to="/membership">Get Membership</Link>
            </Button>
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
