"use client";

import { Crown } from "lucide-react";
import Link from "next/link";
import { useAccount, useReadContract } from "wagmi";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MEMBERSHIP_NFT_ABI } from "@/lib/abis";
import { MEMBERSHIP_NFT_ADDRESS } from "@/lib/constants";

export function MembershipBadge() {
  const { address: userAddress, isConnected } = useAccount();

  const { data: hasActive } = useReadContract({
    address: MEMBERSHIP_NFT_ADDRESS,
    abi: MEMBERSHIP_NFT_ABI,
    functionName: "hasActiveMembership",
    args: [userAddress ?? "0x0"],
    query: { enabled: !!userAddress },
  });

  if (!isConnected) return null;

  if (hasActive) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href="/membership">
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-primary hover:bg-primary/10 hover:text-primary"
              >
                <Crown className="h-4 w-4" />
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            <p>Active Member</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href="/membership">
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <Crown className="h-4 w-4" />
            </Button>
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <p>Get Membership</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
