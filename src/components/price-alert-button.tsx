"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PriceAlertDialog } from "@/components/price-alert-dialog";
import { usePriceAlertsContext } from "@/components/price-alerts-provider";
import { MEMBERSHIP_NFT_ABI } from "@/lib/abis";
import { MEMBERSHIP_NFT_ADDRESS } from "@/lib/constants";

interface PriceAlertButtonProps {
  token: {
    address: string;
    symbol?: string;
    name?: string;
    priceUsd?: string;
  };
}

export function PriceAlertButton({ token }: PriceAlertButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { getAlertsForToken } = usePriceAlertsContext();
  const { address, isConnected } = useAccount();

  const { data: hasActiveMembership } = useReadContract({
    address: MEMBERSHIP_NFT_ADDRESS,
    abi: MEMBERSHIP_NFT_ABI,
    functionName: "hasActiveMembership",
    args: [address ?? "0x0"],
    query: { enabled: !!address },
  });

  const tokenAlerts = getAlertsForToken(token.address);
  const activeAlertCount = tokenAlerts.filter((a) => !a.triggered).length;

  const isMember = isConnected && hasActiveMembership;

  if (!isMember) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" asChild>
              <Link href="/membership">
                <Bell className="h-4 w-4" />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Membership required for price alerts</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setDialogOpen(true)}
        className="relative"
        title="Create price alert"
      >
        <Bell className="h-4 w-4" />
        {activeAlertCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
            {activeAlertCount}
          </span>
        )}
      </Button>
      <PriceAlertDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        token={token}
      />
    </>
  );
}
