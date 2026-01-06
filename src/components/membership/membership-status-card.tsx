"use client";

import { Crown, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useAccount, useReadContract } from "wagmi";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MEMBERSHIP_NFT_ABI } from "@/lib/abis";
import { EXPLORER_URL, MEMBERSHIP_NFT_ADDRESS } from "@/lib/constants";

export function MembershipStatusCard() {
  const { address: userAddress, isConnected } = useAccount();

  const { data: hasActive, isLoading } = useReadContract({
    address: MEMBERSHIP_NFT_ADDRESS,
    abi: MEMBERSHIP_NFT_ABI,
    functionName: "hasActiveMembership",
    args: [userAddress ?? "0x0"],
    query: { enabled: !!userAddress },
  });

  const { data: balance } = useReadContract({
    address: MEMBERSHIP_NFT_ADDRESS,
    abi: MEMBERSHIP_NFT_ABI,
    functionName: "balanceOf",
    args: [userAddress ?? "0x0"],
    query: { enabled: !!userAddress },
  });

  if (!isConnected || isLoading) return null;
  if (!hasActive) return null;

  return (
    <Card className="w-full max-w-lg border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-transparent p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
            <Crown className="h-6 w-6 text-emerald-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold">Active Member</h3>
              <Badge
                variant="outline"
                className="border-emerald-500/50 text-emerald-500"
              >
                Active
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              You own {balance?.toString() ?? "1"} membership NFT
              {balance && balance > 1n ? "s" : ""}
            </p>
          </div>
        </div>
        <Link
          href={`${EXPLORER_URL}/address/${MEMBERSHIP_NFT_ADDRESS}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          <ExternalLink className="h-4 w-4" />
        </Link>
      </div>
    </Card>
  );
}
