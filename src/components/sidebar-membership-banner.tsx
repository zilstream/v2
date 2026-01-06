"use client";

import { Crown } from "lucide-react";
import Link from "next/link";
import { useAccount, useReadContract } from "wagmi";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ZilStreamLogo } from "@/components/zilstream-logo";
import { MEMBERSHIP_NFT_ABI } from "@/lib/abis";
import { MEMBERSHIP_NFT_ADDRESS } from "@/lib/constants";

export function SidebarMembershipBanner() {
  const { address: userAddress, isConnected } = useAccount();

  const { data: hasActive } = useReadContract({
    address: MEMBERSHIP_NFT_ADDRESS,
    abi: MEMBERSHIP_NFT_ABI,
    functionName: "hasActiveMembership",
    args: [userAddress ?? "0x0"],
    query: { enabled: !!userAddress },
  });

  if (isConnected && hasActive) {
    return (
      <Card className="mx-2 mb-2 gap-0 border-primary/20 bg-gradient-to-br from-primary/10 to-transparent p-0 shadow-none">
        <div className="p-4">
          <div className="mb-1.5 flex items-center gap-2 text-sm font-bold text-primary">
            <Crown className="h-4 w-4" />
            Active Member
          </div>
          <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
            Thank you for supporting ZilStream!
          </p>
          <Button
            asChild
            size="sm"
            variant="outline"
            className="h-7 w-full border-primary/30 text-xs font-medium shadow-none hover:bg-primary/10"
          >
            <Link href="/membership">View Membership</Link>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mx-2 mb-2 gap-0 border-primary/20 bg-gradient-to-br from-primary/10 to-transparent p-0 shadow-none">
      <div className="p-4">
        <div className="mb-1.5 flex items-center gap-2 text-sm font-bold text-primary">
          <ZilStreamLogo className="h-4 w-4" />
          ZilStream Membership
        </div>
        <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
          Acquire your yearly membership with STREAM
        </p>
        <Button
          asChild
          size="sm"
          className="h-7 w-full bg-primary text-xs font-medium text-primary-foreground shadow-none hover:bg-primary/90"
        >
          <Link href="/membership">Get Membership</Link>
        </Button>
      </div>
    </Card>
  );
}
