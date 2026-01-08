"use client";

import {
  BarChart3,
  Bell,
  Crown,
  Download,
  LayoutDashboard,
  Sparkles,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import * as React from "react";
import { useAccount, useReadContract } from "wagmi";

import { ConnectWalletButton } from "@/components/connect-button";
import { MembershipActiveCard } from "@/components/membership/membership-active-card";
import { MembershipListCard } from "@/components/membership/membership-list-card";
import { MembershipPurchaseCard } from "@/components/membership/membership-purchase-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MEMBERSHIP_NFT_ABI } from "@/lib/abis";
import { MEMBERSHIP_NFT_ADDRESS } from "@/lib/constants";

const MEMBER_FEATURES = [
  {
    icon: LayoutDashboard,
    title: "Personal Dashboard",
    description: "Track your portfolio, positions, and performance in one place",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Access detailed charts and historical data for all tokens",
  },
  {
    icon: Download,
    title: "Data Exports",
    description: "Export your transaction history and portfolio data",
  },
  {
    icon: Bell,
    title: "Price Alerts",
    description: "Get notified when tokens hit your target prices",
  },
  {
    icon: TrendingUp,
    title: "Portfolio Insights",
    description: "See your gains, losses, and portfolio allocation over time",
  },
  {
    icon: Zap,
    title: "Early Access",
    description: "Be the first to try new features before public release",
  },
];

export default function MembershipPage() {
  const [showGiftPurchase, setShowGiftPurchase] = React.useState(false);
  const { address: userAddress, isConnected } = useAccount();

  const {
    data: hasActive,
    isLoading,
    refetch: refetchMembership,
  } = useReadContract({
    address: MEMBERSHIP_NFT_ADDRESS,
    abi: MEMBERSHIP_NFT_ABI,
    functionName: "hasActiveMembership",
    args: [userAddress ?? "0x0"],
    query: { enabled: !!userAddress },
  });

  const { data: activeMembershipInfo, refetch: refetchActiveMembership } =
    useReadContract({
      address: MEMBERSHIP_NFT_ADDRESS,
      abi: MEMBERSHIP_NFT_ABI,
      functionName: "getActiveMembership",
      args: [userAddress ?? "0x0"],
      query: { enabled: !!userAddress },
    });

  const activeTokenId = activeMembershipInfo?.[0] ?? null;
  const showActiveCard = isConnected && hasActive && !showGiftPurchase;
  const showFeatures = !showActiveCard && !showGiftPurchase;

  const handleGiftPurchaseSuccess = () => {
    setShowGiftPurchase(false);
    refetchMembership();
    refetchActiveMembership();
  };

  const handleTransferSuccess = () => {
    refetchMembership();
    refetchActiveMembership();
  };

  if (!isConnected) {
    return (
      <div className="flex w-full flex-col items-center justify-center gap-6 p-6 min-h-[60vh]">
        <Card className="w-full max-w-xl text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Wallet className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              Connect your wallet to purchase or manage your ZilStream
              membership.
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
    <div className="container mx-auto max-w-screen-xl px-4 py-12">
      <div className="mb-8 space-y-2 text-center">
        <div className="flex items-center justify-center gap-2">
          <Crown className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">ZilStream Membership</h1>
        </div>
        <p className="text-muted-foreground">
          {showGiftPurchase
            ? "Purchase a membership to gift to someone"
            : showActiveCard
              ? "Manage your ZilStream membership"
              : "Support ZilStream and unlock exclusive features"}
        </p>
      </div>

      {isLoading ? (
        <div className="mx-auto h-64 w-full max-w-lg animate-pulse rounded-lg bg-muted" />
      ) : showActiveCard ? (
        <div className="mx-auto flex max-w-lg flex-col items-center gap-6">
          <MembershipActiveCard onGiftClick={() => setShowGiftPurchase(true)} />
          <MembershipListCard
            activeTokenId={activeTokenId}
            onTransferSuccess={handleTransferSuccess}
          />
        </div>
      ) : (
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2">
          {showFeatures && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="flex items-center gap-2 text-xl font-semibold">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Member Benefits
                </h2>
                <p className="text-sm text-muted-foreground">
                  Unlock these features with a ZilStream membership
                </p>
              </div>

              <div className="grid gap-3">
                {MEMBER_FEATURES.map((feature) => (
                  <Card
                    key={feature.title}
                    className="flex items-start gap-4 p-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-medium">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className={showFeatures ? "" : "mx-auto w-full max-w-lg lg:col-span-2"}>
            <MembershipPurchaseCard
              onPurchaseSuccess={
                showGiftPurchase ? handleGiftPurchaseSuccess : refetchMembership
              }
              onCancel={
                showGiftPurchase ? () => setShowGiftPurchase(false) : undefined
              }
              isGiftMode={showGiftPurchase}
            />
          </div>
        </div>
      )}
    </div>
  );
}
