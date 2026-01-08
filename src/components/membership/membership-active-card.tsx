"use client";

import { useConnectModal } from "@rainbow-me/rainbowkit";
import {
  CalendarClock,
  Check,
  Crown,
  ExternalLink,
  Loader2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";
import { formatUnits } from "viem";
import {
  useAccount,
  useBalance,
  useChainId,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ERC20_ABI, MEMBERSHIP_NFT_ABI } from "@/lib/abis";
import { EXPLORER_URL, MEMBERSHIP_NFT_ADDRESS } from "@/lib/constants";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { zilliqa } from "@/lib/wagmi";

interface MembershipActiveCardProps {
  onGiftClick?: () => void;
}

export function MembershipActiveCard({
  onGiftClick,
}: MembershipActiveCardProps) {
  const [selectedYears, setSelectedYears] = React.useState(1);
  const [paymentType, setPaymentType] = React.useState<"zil" | "token">("zil");
  const [txHash, setTxHash] = React.useState<`0x${string}` | null>(null);
  const [txType, setTxType] = React.useState<"approve" | "renew" | null>(null);
  const [isApproving, setIsApproving] = React.useState(false);
  const [isRenewing, setIsRenewing] = React.useState(false);
  const [showExtend, setShowExtend] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const { isConnected, address: userAddress } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { writeContractAsync } = useWriteContract();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();

  const ensureCorrectNetwork = async () => {
    if (chainId === zilliqa.id) return true;

    try {
      await switchChainAsync({ chainId: zilliqa.id });
      return true;
    } catch {
      setError(
        `Please switch to Zilliqa network in your wallet. Current network ID: ${chainId}`,
      );
      return false;
    }
  };

  const { data: txReceipt } = useWaitForTransactionReceipt({
    hash: txHash || undefined,
  });

  // Get user's active membership in a single call
  const {
    data: membershipInfo,
    isLoading: isLoadingMembership,
    refetch: refetchMembership,
  } = useReadContract({
    address: MEMBERSHIP_NFT_ADDRESS,
    abi: MEMBERSHIP_NFT_ABI,
    functionName: "getActiveMembership",
    args: [userAddress ?? "0x0"],
    query: { enabled: !!userAddress },
  });

  const tokenId = membershipInfo?.[0] ?? null;
  const expiryTimestamp = membershipInfo?.[1] ?? null;

  // Contract reads for extension
  const { data: maxYears } = useReadContract({
    address: MEMBERSHIP_NFT_ADDRESS,
    abi: MEMBERSHIP_NFT_ABI,
    functionName: "maxYears",
  });

  const { data: pricePerYearZil } = useReadContract({
    address: MEMBERSHIP_NFT_ADDRESS,
    abi: MEMBERSHIP_NFT_ABI,
    functionName: "pricePerYearZil",
  });

  const { data: pricePerYearToken } = useReadContract({
    address: MEMBERSHIP_NFT_ADDRESS,
    abi: MEMBERSHIP_NFT_ABI,
    functionName: "pricePerYearToken",
  });

  const { data: discountTiers } = useReadContract({
    address: MEMBERSHIP_NFT_ADDRESS,
    abi: MEMBERSHIP_NFT_ABI,
    functionName: "getDiscountTiers",
  });

  const { data: paymentTokenAddress } = useReadContract({
    address: MEMBERSHIP_NFT_ADDRESS,
    abi: MEMBERSHIP_NFT_ABI,
    functionName: "paymentToken",
  });

  const { data: priceZil } = useReadContract({
    address: MEMBERSHIP_NFT_ADDRESS,
    abi: MEMBERSHIP_NFT_ABI,
    functionName: "calculatePriceZil",
    args: [BigInt(selectedYears)],
  });

  const { data: priceToken } = useReadContract({
    address: MEMBERSHIP_NFT_ADDRESS,
    abi: MEMBERSHIP_NFT_ABI,
    functionName: "calculatePriceToken",
    args: [BigInt(selectedYears)],
  });

  // Balances
  const { data: zilBalance } = useBalance({
    address: userAddress,
    query: { enabled: !!userAddress },
  });

  const { data: tokenBalance } = useBalance({
    address: userAddress,
    token: paymentTokenAddress as `0x${string}`,
    query: { enabled: !!userAddress && !!paymentTokenAddress },
  });

  // Token allowance
  const { data: tokenAllowance, refetch: refetchAllowance } = useReadContract({
    address: paymentTokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: [userAddress ?? "0x0", MEMBERSHIP_NFT_ADDRESS],
    query: { enabled: !!userAddress && !!paymentTokenAddress },
  });

  const yearOptions = React.useMemo(() => {
    const max = maxYears ? Number(maxYears) : 5;
    return Array.from({ length: max }, (_, i) => i + 1);
  }, [maxYears]);

  const getDiscount = (years: number) => {
    if (!discountTiers || years < 1) return 0;
    const tierIndex = years - 1;
    if (tierIndex >= discountTiers.length) {
      return discountTiers.length > 0
        ? Number(discountTiers[discountTiers.length - 1])
        : 0;
    }
    return Number(discountTiers[tierIndex]);
  };

  const calculateSavings = (years: number) => {
    if (years <= 1) return 0n;
    if (paymentType === "zil") {
      if (!pricePerYearZil) return 0n;
      const fullPrice = pricePerYearZil * BigInt(years);
      return fullPrice - (priceZil ?? 0n);
    }
    if (!pricePerYearToken) return 0n;
    const fullPrice = pricePerYearToken * BigInt(years);
    return fullPrice - (priceToken ?? 0n);
  };

  const currentPrice = paymentType === "zil" ? priceZil : priceToken;
  const needsApproval =
    paymentType === "token" &&
    currentPrice &&
    (tokenAllowance ?? 0n) < currentPrice;
  const hasInsufficientBalance =
    paymentType === "zil"
      ? (zilBalance?.value ?? 0n) < (currentPrice ?? 0n)
      : (tokenBalance?.value ?? 0n) < (currentPrice ?? 0n);

  const expiryDate = expiryTimestamp
    ? new Date(Number(expiryTimestamp) * 1000)
    : null;

  const daysUntilExpiry = expiryDate
    ? Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  const isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0;

  // TX success handling
  React.useEffect(() => {
    if (txReceipt?.status === "success") {
      if (txType === "approve") {
        toast.success("Token approved successfully");
        refetchAllowance();
        setTxHash(null);
        setTxType(null);
      } else if (txType === "renew") {
        toast.success("Membership extended successfully!");
        refetchMembership();
        setTxHash(null);
        setTxType(null);
        setShowExtend(false);
      }
    }
  }, [txReceipt, txType, refetchAllowance, refetchMembership]);

  const handleApprove = async () => {
    if (!isConnected || !paymentTokenAddress || !currentPrice) {
      openConnectModal?.();
      return;
    }

    try {
      setError(null);
      setIsApproving(true);

      const isCorrectNetwork = await ensureCorrectNetwork();
      if (!isCorrectNetwork) {
        setIsApproving(false);
        return;
      }

      const tx = await writeContractAsync({
        chainId: zilliqa.id,
        address: paymentTokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [MEMBERSHIP_NFT_ADDRESS, currentPrice],
      });

      setTxHash(tx);
      setTxType("approve");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Approval failed";
      setError(errorMessage);
    } finally {
      setIsApproving(false);
    }
  };

  const handleRenew = async () => {
    if (!isConnected) {
      openConnectModal?.();
      return;
    }

    if (!currentPrice || !tokenId) return;

    try {
      setError(null);
      setIsRenewing(true);

      const isCorrectNetwork = await ensureCorrectNetwork();
      if (!isCorrectNetwork) {
        setIsRenewing(false);
        return;
      }

      const maxPrice = (currentPrice * 101n) / 100n;

      let tx: `0x${string}`;

      if (paymentType === "zil") {
        tx = await writeContractAsync({
          chainId: zilliqa.id,
          address: MEMBERSHIP_NFT_ADDRESS,
          abi: MEMBERSHIP_NFT_ABI,
          functionName: "renewWithZil",
          args: [tokenId, BigInt(selectedYears), maxPrice],
          value: maxPrice,
        });
      } else {
        tx = await writeContractAsync({
          chainId: zilliqa.id,
          address: MEMBERSHIP_NFT_ADDRESS,
          abi: MEMBERSHIP_NFT_ABI,
          functionName: "renewWithToken",
          args: [tokenId, BigInt(selectedYears), maxPrice],
        });
      }

      setTxHash(tx);
      setTxType("renew");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Renewal failed";
      setError(errorMessage);
    } finally {
      setIsRenewing(false);
    }
  };

  const getButtonLabel = () => {
    if (!isConnected) return "Connect Wallet";
    if (hasInsufficientBalance) return "Insufficient Balance";
    if (needsApproval) {
      if (isApproving) return "Approving...";
      return "Approve STREAM";
    }
    if (isRenewing || (txHash && txType === "renew")) return "Extending...";
    return "Extend Membership";
  };

  const isButtonDisabled =
    !currentPrice ||
    !tokenId ||
    tokenId === 0n ||
    hasInsufficientBalance ||
    isApproving ||
    isRenewing ||
    !!txHash;

  if (!isConnected) return null;

  if (isLoadingMembership) {
    return (
      <Card className="w-full max-w-lg p-8">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-24 w-24 rounded-full" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </Card>
    );
  }

  const canExtend = tokenId !== null && tokenId > 0n;

  return (
    <Card className="w-full max-w-lg overflow-hidden">
      <div className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-8">
        <div className="absolute right-4 top-4">
          <Link
            href={`${EXPLORER_URL}/address/${MEMBERSHIP_NFT_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>

        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/25">
              <Crown className="h-12 w-12 text-primary-foreground" />
            </div>
            <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 shadow-md">
              <Check className="h-4 w-4 text-white" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-2xl font-bold">Active Member</h2>
              <Badge className="bg-emerald-500 text-white hover:bg-emerald-600">
                Active
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Thank you for supporting ZilStream
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-6">
        {expiryDate && (
          <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
            <div className="flex items-center gap-3">
              <CalendarClock
                className={cn(
                  "h-5 w-5",
                  isExpiringSoon ? "text-amber-500" : "text-muted-foreground",
                )}
              />
              <div>
                <p className="text-sm text-muted-foreground">Expires</p>
                <p
                  className={cn(
                    "font-semibold",
                    isExpiringSoon && "text-amber-500",
                  )}
                >
                  {expiryDate.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Time left</p>
              <p
                className={cn(
                  "font-semibold",
                  isExpiringSoon && "text-amber-500",
                )}
              >
                {daysUntilExpiry} days
              </p>
            </div>
          </div>
        )}

        {isExpiringSoon && !showExtend && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-center text-sm text-amber-600 dark:text-amber-400">
            Your membership expires soon. Consider extending it to keep your
            benefits.
          </div>
        )}

        {!showExtend ? (
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowExtend(true)}
              disabled={!canExtend}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {canExtend ? "Extend Membership" : "Loading membership data..."}
            </Button>
            {onGiftClick && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={onGiftClick}
                  className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  Buy another membership as a gift
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Extend Membership</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowExtend(false)}
              >
                Cancel
              </Button>
            </div>

            {/* Year Selection */}
            <div className="space-y-2">
              <span className="text-sm font-medium">Duration</span>
              <div className="grid grid-cols-5 gap-2">
                {yearOptions.map((years) => {
                  const discount = getDiscount(years);
                  const isSelected = selectedYears === years;

                  return (
                    <button
                      key={years}
                      type="button"
                      onClick={() => setSelectedYears(years)}
                      className={cn(
                        "relative flex flex-col items-center rounded-lg border-2 p-2 transition-all",
                        isSelected
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50",
                      )}
                    >
                      <span className="font-bold">{years}</span>
                      <span className="text-xs text-muted-foreground">
                        {years === 1 ? "yr" : "yrs"}
                      </span>
                      {discount > 0 && (
                        <span className="absolute -right-1 -top-1 rounded-full bg-emerald-500 px-1 py-0.5 text-[9px] font-medium text-white">
                          -{discount / 100}%
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <span className="text-sm font-medium">Payment</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentType("zil")}
                  className={cn(
                    "rounded-lg border-2 px-3 py-2 text-sm font-semibold transition-all",
                    paymentType === "zil"
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50",
                  )}
                >
                  ZIL
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentType("token")}
                  className={cn(
                    "rounded-lg border-2 px-3 py-2 text-sm font-semibold transition-all",
                    paymentType === "token"
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50",
                  )}
                >
                  STREAM
                </button>
              </div>
            </div>

            {/* Price Summary */}
            <div className="space-y-1 rounded-lg bg-muted/50 p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="font-bold">
                  {currentPrice
                    ? `${formatNumber(Number(formatUnits(currentPrice, paymentType === "zil" ? 18 : 8)), 2)} ${paymentType === "zil" ? "ZIL" : "STREAM"}`
                    : "..."}
                </span>
              </div>
              {selectedYears > 1 &&
                (paymentType === "zil"
                  ? pricePerYearZil
                  : pricePerYearToken) && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">You save</span>
                    <span className="font-medium text-emerald-500">
                      {formatNumber(
                        Number(
                          formatUnits(
                            calculateSavings(selectedYears),
                            paymentType === "zil" ? 18 : 8,
                          ),
                        ),
                        2,
                      )}{" "}
                      {paymentType === "zil" ? "ZIL" : "STREAM"}
                    </span>
                  </div>
                )}
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-md bg-rose-50 p-2 text-center text-xs text-rose-500 dark:bg-rose-950/50">
                {error}
              </div>
            )}

            {/* Action Button */}
            <Button
              className="w-full"
              disabled={isButtonDisabled && isConnected}
              onClick={
                !isConnected
                  ? openConnectModal
                  : needsApproval
                    ? handleApprove
                    : handleRenew
              }
            >
              {(isApproving || isRenewing || txHash) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {getButtonLabel()}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
