"use client";

import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Check, Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
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

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ERC20_ABI, MEMBERSHIP_NFT_ABI } from "@/lib/abis";
import { MEMBERSHIP_NFT_ADDRESS } from "@/lib/constants";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { zilliqa } from "@/lib/wagmi";

interface MembershipPurchaseCardProps {
  onPurchaseSuccess?: () => void;
  onCancel?: () => void;
  isGiftMode?: boolean;
}

export function MembershipPurchaseCard({
  onPurchaseSuccess,
  onCancel,
  isGiftMode,
}: MembershipPurchaseCardProps) {
  const [selectedYears, setSelectedYears] = React.useState(1);
  const [paymentType, setPaymentType] = React.useState<"zil" | "token">("zil");
  const [txHash, setTxHash] = React.useState<`0x${string}` | null>(null);
  const [txType, setTxType] = React.useState<"approve" | "purchase" | null>(
    null,
  );
  const [isApproving, setIsApproving] = React.useState(false);
  const [isPurchasing, setIsPurchasing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const router = useRouter();
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

  // Contract reads
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

  // TX success handling
  React.useEffect(() => {
    if (txReceipt?.status === "success") {
      if (txType === "approve") {
        toast.success("Token approved successfully");
        refetchAllowance();
        setTxHash(null);
        setTxType(null);
      } else if (txType === "purchase") {
        toast.success("Membership purchased successfully!", {
          action: {
            label: "View Transaction",
            onClick: () => router.push(`/tx/${txReceipt.transactionHash}`),
          },
        });
        setTxHash(null);
        setTxType(null);
        onPurchaseSuccess?.();
      }
    }
  }, [txReceipt, txType, refetchAllowance, router, onPurchaseSuccess]);

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

  const handlePurchase = async () => {
    if (!isConnected) {
      openConnectModal?.();
      return;
    }

    if (!currentPrice) return;

    try {
      setError(null);
      setIsPurchasing(true);

      const isCorrectNetwork = await ensureCorrectNetwork();
      if (!isCorrectNetwork) {
        setIsPurchasing(false);
        return;
      }

      // Add 1% buffer for price protection
      const maxPrice = (currentPrice * 101n) / 100n;

      let tx: `0x${string}`;

      if (paymentType === "zil") {
        tx = await writeContractAsync({
          chainId: zilliqa.id,
          address: MEMBERSHIP_NFT_ADDRESS,
          abi: MEMBERSHIP_NFT_ABI,
          functionName: "purchaseWithZil",
          args: [BigInt(selectedYears), maxPrice],
          value: maxPrice,
        });
      } else {
        tx = await writeContractAsync({
          chainId: zilliqa.id,
          address: MEMBERSHIP_NFT_ADDRESS,
          abi: MEMBERSHIP_NFT_ABI,
          functionName: "purchaseWithToken",
          args: [BigInt(selectedYears), maxPrice],
        });
      }

      setTxHash(tx);
      setTxType("purchase");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Purchase failed";
      setError(errorMessage);
    } finally {
      setIsPurchasing(false);
    }
  };

  const getButtonLabel = () => {
    if (!isConnected) return "Connect Wallet";
    if (hasInsufficientBalance) return "Insufficient Balance";
    if (needsApproval) {
      if (isApproving) return "Approving...";
      return "Approve STREAM";
    }
    if (isPurchasing || (txHash && txType === "purchase"))
      return "Purchasing...";
    return "Purchase Membership";
  };

  const isButtonDisabled =
    !currentPrice ||
    hasInsufficientBalance ||
    isApproving ||
    isPurchasing ||
    !!txHash;

  return (
    <Card className="w-full max-w-lg border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-6">
      <div className="space-y-6">
        <div className="space-y-1 text-center">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">
              {isGiftMode ? "Gift a Membership" : "Get Membership"}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {isGiftMode
              ? "Purchase a membership NFT to transfer to someone else"
              : "Support ZilStream and unlock premium features"}
          </p>
        </div>

        {/* Year Selection */}
        <div className="space-y-3">
          <span className="text-sm font-medium">Select Duration</span>
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
                    "relative flex flex-col items-center rounded-lg border-2 p-3 transition-all",
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50",
                  )}
                >
                  <span className="text-lg font-bold">{years}</span>
                  <span className="text-xs text-muted-foreground">
                    {years === 1 ? "year" : "years"}
                  </span>
                  {discount > 0 && (
                    <span className="absolute -top-2 right-0 rounded-full bg-emerald-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
                      -{discount / 100}%
                    </span>
                  )}
                  {isSelected && (
                    <Check className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-primary p-0.5 text-primary-foreground" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Payment Method */}
        <div className="space-y-3">
          <span className="text-sm font-medium">Payment Method</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPaymentType("zil")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 transition-all",
                paymentType === "zil"
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50",
              )}
            >
              <span className="font-semibold">ZIL</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentType("token")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 transition-all",
                paymentType === "token"
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50",
              )}
            >
              <span className="font-semibold">STREAM</span>
            </button>
          </div>
        </div>

        {/* Price Summary */}
        <div className="space-y-2 rounded-lg bg-muted/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Price</span>
            <span className="text-xl font-bold">
              {currentPrice
                ? `${formatNumber(Number(formatUnits(currentPrice, paymentType === "zil" ? 18 : 8)), 2)} ${paymentType === "zil" ? "ZIL" : "STREAM"}`
                : "..."}
            </span>
          </div>
          {selectedYears > 1 &&
            (paymentType === "zil" ? pricePerYearZil : pricePerYearToken) && (
              <div className="flex items-center justify-between text-sm">
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
          {isConnected && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Your balance</span>
              <span>
                {paymentType === "zil"
                  ? `${formatNumber(Number(zilBalance?.formatted ?? 0), 2)} ZIL`
                  : `${formatNumber(Number(tokenBalance?.formatted ?? 0), 2)} STREAM`}
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
          size="lg"
          className="w-full font-semibold"
          disabled={isButtonDisabled && isConnected}
          onClick={
            !isConnected
              ? openConnectModal
              : needsApproval
                ? handleApprove
                : handlePurchase
          }
        >
          {(isApproving || isPurchasing || txHash) && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {getButtonLabel()}
        </Button>

        {onCancel && (
          <div className="text-center">
            <button
              type="button"
              onClick={onCancel}
              className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Cancel and go back
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}
