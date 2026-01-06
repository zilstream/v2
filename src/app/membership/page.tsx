"use client";

import * as React from "react";
import { useAccount, useReadContract } from "wagmi";

import { MembershipActiveCard } from "@/components/membership/membership-active-card";
import { MembershipPurchaseCard } from "@/components/membership/membership-purchase-card";
import { MEMBERSHIP_NFT_ABI } from "@/lib/abis";
import { MEMBERSHIP_NFT_ADDRESS } from "@/lib/constants";

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

  const showActiveCard = isConnected && hasActive && !showGiftPurchase;

  const handleGiftPurchaseSuccess = () => {
    refetchMembership();
    setShowGiftPurchase(false);
  };

  return (
    <div className="container mx-auto flex min-h-[80vh] max-w-screen-lg flex-col items-center justify-center gap-6 py-12">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">ZilStream Membership</h1>
        <p className="text-muted-foreground">
          {showGiftPurchase
            ? "Purchase a membership to gift to someone"
            : showActiveCard
              ? "Manage your ZilStream membership"
              : "Support ZilStream and unlock exclusive features"}
        </p>
      </div>
      {isLoading ? (
        <div className="h-64 w-full max-w-lg animate-pulse rounded-lg bg-muted" />
      ) : showActiveCard ? (
        <MembershipActiveCard onGiftClick={() => setShowGiftPurchase(true)} />
      ) : (
        <MembershipPurchaseCard
          onPurchaseSuccess={
            showGiftPurchase ? handleGiftPurchaseSuccess : refetchMembership
          }
          onCancel={showGiftPurchase ? () => setShowGiftPurchase(false) : undefined}
          isGiftMode={showGiftPurchase}
        />
      )}
    </div>
  );
}
