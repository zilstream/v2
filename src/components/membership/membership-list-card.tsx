"use client";

import { AlertTriangle, Gift, Loader2, Send } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { isAddress } from "viem";
import {
  useAccount,
  useChainId,
  useReadContract,
  useReadContracts,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MEMBERSHIP_NFT_ABI } from "@/lib/abis";
import { MEMBERSHIP_NFT_ADDRESS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { zilliqa } from "@/lib/wagmi";

interface MembershipListCardProps {
  activeTokenId: bigint | null;
  onTransferSuccess?: () => void;
}

interface MembershipToken {
  tokenId: bigint;
  expiry: bigint;
  isActive: boolean;
}

export function MembershipListCard({
  activeTokenId,
  onTransferSuccess,
}: MembershipListCardProps) {
  const [selectedToken, setSelectedToken] =
    React.useState<MembershipToken | null>(null);
  const [recipientAddress, setRecipientAddress] = React.useState("");
  const [showWarning, setShowWarning] = React.useState(false);
  const [txHash, setTxHash] = React.useState<`0x${string}` | null>(null);
  const [isTransferring, setIsTransferring] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const { address: userAddress } = useAccount();
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

  const {
    data: tokenIds,
    isLoading: isLoadingTokens,
    refetch: refetchTokens,
  } = useReadContract({
    address: MEMBERSHIP_NFT_ADDRESS,
    abi: MEMBERSHIP_NFT_ABI,
    functionName: "tokensOfOwner",
    args: [userAddress ?? "0x0"],
    query: { enabled: !!userAddress },
  });

  const expiryContracts = React.useMemo(() => {
    if (!tokenIds || tokenIds.length === 0) return [];
    return tokenIds.map((tokenId) => ({
      address: MEMBERSHIP_NFT_ADDRESS,
      abi: MEMBERSHIP_NFT_ABI,
      functionName: "membershipExpiry" as const,
      args: [tokenId],
    }));
  }, [tokenIds]);

  const { data: expiryResults, isLoading: isLoadingExpiry } = useReadContracts({
    contracts: expiryContracts,
    query: { enabled: expiryContracts.length > 0 },
  });

  const memberships = React.useMemo(() => {
    if (!tokenIds || !expiryResults) return [];

    const now = BigInt(Math.floor(Date.now() / 1000));

    return tokenIds
      .map((tokenId, index) => {
        const expiryResult = expiryResults[index];
        const expiry =
          expiryResult?.status === "success"
            ? (expiryResult.result as bigint)
            : 0n;
        return {
          tokenId,
          expiry,
          isActive: expiry > now,
        };
      })
      .filter((m) => m.tokenId !== activeTokenId);
  }, [tokenIds, expiryResults, activeTokenId]);

  const activeMembershipsCount = React.useMemo(() => {
    if (!tokenIds || !expiryResults) return 0;
    const now = BigInt(Math.floor(Date.now() / 1000));
    return tokenIds.reduce((count, _, index) => {
      const expiryResult = expiryResults[index];
      const expiry =
        expiryResult?.status === "success"
          ? (expiryResult.result as bigint)
          : 0n;
      return expiry > now ? count + 1 : count;
    }, 0);
  }, [tokenIds, expiryResults]);

  const isValidAddress = recipientAddress && isAddress(recipientAddress);
  const isSameAddress =
    recipientAddress.toLowerCase() === userAddress?.toLowerCase();

  React.useEffect(() => {
    if (txReceipt?.status === "success") {
      toast.success("Membership transferred successfully!");
      setTxHash(null);
      setSelectedToken(null);
      setRecipientAddress("");
      setShowWarning(false);
      refetchTokens();
      onTransferSuccess?.();
    }
  }, [txReceipt, refetchTokens, onTransferSuccess]);

  const handleTransferClick = (token: MembershipToken) => {
    setSelectedToken(token);
    setRecipientAddress("");
    setError(null);
    setShowWarning(false);
  };

  const handleConfirmTransfer = () => {
    if (selectedToken?.isActive && activeMembershipsCount === 1) {
      setShowWarning(true);
      return;
    }
    executeTransfer();
  };

  const executeTransfer = async () => {
    if (!selectedToken || !userAddress || !isValidAddress) return;

    try {
      setError(null);
      setIsTransferring(true);

      const isCorrectNetwork = await ensureCorrectNetwork();
      if (!isCorrectNetwork) {
        setIsTransferring(false);
        return;
      }

      const tx = await writeContractAsync({
        chainId: zilliqa.id,
        address: MEMBERSHIP_NFT_ADDRESS,
        abi: MEMBERSHIP_NFT_ABI,
        functionName: "transferFrom",
        args: [
          userAddress,
          recipientAddress as `0x${string}`,
          selectedToken.tokenId,
        ],
      });

      setTxHash(tx);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Transfer failed";
      setError(errorMessage);
    } finally {
      setIsTransferring(false);
    }
  };

  const handleCloseDialog = () => {
    if (isTransferring || txHash) return;
    setSelectedToken(null);
    setRecipientAddress("");
    setError(null);
    setShowWarning(false);
  };

  if (isLoadingTokens || isLoadingExpiry) {
    return null;
  }

  if (memberships.length === 0) {
    return null;
  }

  return (
    <>
      <Card className="w-full max-w-lg">
        <div className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Gift className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">Additional Memberships</h3>
            <Badge variant="secondary" className="ml-auto">
              {memberships.length}
            </Badge>
          </div>

          <div className="space-y-3">
            {memberships.map((membership) => {
              const expiryDate = new Date(Number(membership.expiry) * 1000);
              const daysUntilExpiry = Math.ceil(
                (expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
              );

              return (
                <div
                  key={membership.tokenId.toString()}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        Membership #{membership.tokenId.toString()}
                      </span>
                      <Badge
                        variant={membership.isActive ? "default" : "secondary"}
                        className={cn(
                          membership.isActive
                            ? "bg-emerald-500 hover:bg-emerald-600"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {membership.isActive ? "Active" : "Expired"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {membership.isActive
                        ? `Expires in ${daysUntilExpiry} days`
                        : `Expired ${expiryDate.toLocaleDateString()}`}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTransferClick(membership)}
                  >
                    <Send className="mr-1.5 h-3.5 w-3.5" />
                    Transfer
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <Dialog
        open={!!selectedToken}
        onOpenChange={(open) => !open && handleCloseDialog()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {showWarning ? "Warning" : "Transfer Membership"}
            </DialogTitle>
            <DialogDescription>
              {showWarning
                ? "This is your last active membership. Transferring it will remove your ZilStream membership benefits."
                : `Transfer Membership #${selectedToken?.tokenId.toString()} to another address.`}
            </DialogDescription>
          </DialogHeader>

          {showWarning ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                <div className="text-sm">
                  <p className="font-medium text-amber-600 dark:text-amber-400">
                    You will lose your membership
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    After this transfer, you will no longer have an active
                    ZilStream membership. You can purchase a new one at any
                    time.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowWarning(false)}
                  disabled={isTransferring || !!txHash}
                >
                  Go Back
                </Button>
                <Button
                  variant="destructive"
                  onClick={executeTransfer}
                  disabled={isTransferring || !!txHash}
                >
                  {isTransferring || txHash ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Transferring...
                    </>
                  ) : (
                    "Transfer Anyway"
                  )}
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="recipient" className="text-sm font-medium">
                  Recipient Address
                </label>
                <Input
                  id="recipient"
                  placeholder="0x..."
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  disabled={isTransferring || !!txHash}
                />
                {recipientAddress && !isValidAddress && (
                  <p className="text-xs text-destructive">
                    Invalid Ethereum address
                  </p>
                )}
                {isSameAddress && (
                  <p className="text-xs text-destructive">
                    Cannot transfer to yourself
                  </p>
                )}
              </div>

              {error && (
                <div className="rounded-md bg-rose-50 p-2 text-center text-xs text-rose-500 dark:bg-rose-950/50">
                  {error}
                </div>
              )}

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={handleCloseDialog}
                  disabled={isTransferring || !!txHash}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmTransfer}
                  disabled={
                    !isValidAddress ||
                    isSameAddress ||
                    isTransferring ||
                    !!txHash
                  }
                >
                  {isTransferring || txHash ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Transferring...
                    </>
                  ) : (
                    "Transfer"
                  )}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
