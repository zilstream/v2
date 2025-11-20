"use client";

import * as React from "react";
import { Zap, Tag, Settings, ChevronDown } from "lucide-react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient, useBalance } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { parseUnits, formatUnits } from "viem";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";
import { TokenIcon } from "@/components/token-icon";
import type { Pair } from "@/lib/zilstream";
import { 
  PLUNDERSWAP_QUOTER_V2, 
  PLUNDERSWAP_QUOTER_V2_ABI, 
  PLUNDERSWAP_SMART_ROUTER, 
  PLUNDERSWAP_SMART_ROUTER_ABI,
  PLUNDERSWAP_V2_ROUTER,
  PLUNDERSWAP_V2_ROUTER_ABI,
  ERC20_ABI 
} from "@/lib/abis";

const WZIL_ADDRESS = "0x94e18aE7dd5eE57B55f30c4B63E2760c09EFb192";

interface SwapWidgetProps {
  pair: Pair;
  token0Decimals: number;
  token1Decimals: number;
}

export function SwapWidget({ pair, token0Decimals, token1Decimals }: SwapWidgetProps) {
  const [activeTab, setActiveTab] = React.useState<"buy" | "sell">("buy");
  const [amount, setAmount] = React.useState("");
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [slippage, setSlippage] = React.useState("0.5");
  const [deadline, setDeadline] = React.useState("20");

  // Identify if it's V2 or V3
  const isV3 = React.useMemo(() => pair.protocol === "PlunderSwap V3", [pair.protocol]);

  // Fee tier is critical for V3 swaps. Use the pair's fee or fallback to 0.25% (2500)
  const feeTier = React.useMemo(() => {
    return pair.fee ? Number(pair.fee) : 2500;
  }, [pair.fee]);
  
  // Quote state
  const [quote, setQuote] = React.useState<string | null>(null);
  const [isFetchingQuote, setIsFetchingQuote] = React.useState(false);
  const [quoteError, setQuoteError] = React.useState<string | null>(null);

  // Swap/Approval state
  const [isApproving, setIsApproving] = React.useState(false);
  const [isSwapping, setIsSwapping] = React.useState(false);
  const [txHash, setTxHash] = React.useState<`0x${string}` | null>(null);
  const [swapError, setSwapError] = React.useState<string | null>(null);
  
  const { isConnected, address: userAddress } = useAccount();
  const { openConnectModal } = useConnectModal();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const { data: txReceipt, isLoading: isWaitingForTx } = useWaitForTransactionReceipt({
    hash: txHash || undefined,
  });

  // Determine quote token (assuming token1 is quote/native-like for now)
  const quoteToken = React.useMemo(() => ({ 
    symbol: pair.token1Symbol, 
    address: pair.token1, 
    decimals: token1Decimals 
  }), [pair.token1Symbol, pair.token1, token1Decimals]);

  const baseToken = React.useMemo(() => ({ 
    symbol: pair.token0Symbol, 
    address: pair.token0, 
    decimals: token0Decimals 
  }), [pair.token0Symbol, pair.token0, token0Decimals]);

  const inputToken = activeTab === "buy" ? quoteToken : baseToken;
  const outputToken = activeTab === "buy" ? baseToken : quoteToken;

  // Check if input is WZIL (treat as native ZIL)
  const isNativeInput = inputToken.address.toLowerCase() === WZIL_ADDRESS.toLowerCase();

  // Fetch Balance
  const { data: balanceData, refetch: refetchBalance } = useBalance({
    address: userAddress,
    token: isNativeInput ? undefined : (inputToken.address as `0x${string}`),
    query: {
        enabled: !!userAddress,
    }
  });
  
  const balance = balanceData ? balanceData.formatted : "0";

  // Handle Max Balance Click
  const handleMaxBalance = () => {
    if (!balanceData) return;
    
    if (isNativeInput) {
        // Leave 5 ZIL for gas
        const fiveZil = parseUnits("5", 18);
        const maxVal = balanceData.value - fiveZil;
        setAmount(maxVal > 0n ? formatUnits(maxVal, 18) : "0");
    } else {
        setAmount(balanceData.formatted);
    }
  };

  // Calculate presets based on liquidity
  const presets = React.useMemo(() => {
    if (activeTab === "sell") {
      return ["25", "50", "75", "100"];
    }

    const liquidity = Number(pair.liquidityUsd);
    const reserve1 = Number(pair.reserve1) / 10 ** quoteToken.decimals;
    
    // Avoid division by zero
    if (!reserve1 || reserve1 === 0) return ["100", "500", "1000", "2500", "5000", "10000"];

    // Estimated price of Quote Token in USD
    // Liquidity is split 50/50, so Quote Side Value = Liquidity / 2
    const priceUsd = (liquidity / 2) / reserve1;
    
    if (!priceUsd || priceUsd === 0) return ["100", "500", "1000", "2500", "5000", "10000"];

    // Define USD target buckets based on liquidity depth
    let usdTargets: number[];
    if (liquidity < 10000) {
        usdTargets = [1, 5, 10, 25, 50, 100];
    } else if (liquidity < 100000) {
        usdTargets = [10, 25, 50, 100, 250, 500];
    } else {
        usdTargets = [50, 100, 250, 500, 1000, 2500];
    }

    return usdTargets.map(usd => {
      const tokenAmount = usd / priceUsd;
      
      // Round to nice numbers
      if (tokenAmount < 1) return tokenAmount.toPrecision(1);
      if (tokenAmount < 10) return tokenAmount.toPrecision(2);
      
      // For larger numbers, round to 2 significant digits but keep as integer if possible
      const magnitude = 10 ** Math.floor(Math.log10(tokenAmount));
      const normalized = tokenAmount / magnitude;
      const rounded = Math.round(normalized * 2) / 2; // round to nearest 0.5
      return (rounded * magnitude).toString();
    });
  }, [activeTab, pair.liquidityUsd, pair.reserve1, quoteToken.decimals]);

  // Fetch Quote Effect
  React.useEffect(() => {
    // Reset quote when inputs change
    setQuote(null);
    setQuoteError(null);
  }, [activeTab, inputToken.address, outputToken.address]);

  React.useEffect(() => {
    if (!amount || Number.isNaN(Number(amount)) || Number(amount) <= 0) {
      setQuote(null);
      setQuoteError(null);
      return;
    }

    let cancelled = false;
    
    const fetchQuote = async () => {
      if (!publicClient) return;
      
      try {
        setIsFetchingQuote(true);
        setQuoteError(null);

        const amountInWei = parseUnits(amount, inputToken.decimals);
        
        console.log("Fetching quote with:", {
          isV3,
          tokenIn: inputToken.address,
          tokenOut: outputToken.address,
          fee: feeTier,
          amount: amountInWei.toString()
        });

        let quoteAmount: bigint;

        if (isV3) {
            // V3 Quote using QuoterV2
            const result = await publicClient.readContract({
                address: PLUNDERSWAP_QUOTER_V2,
                abi: PLUNDERSWAP_QUOTER_V2_ABI,
                functionName: "quoteExactInputSingle",
                args: [{
                    tokenIn: inputToken.address as `0x${string}`,
                    tokenOut: outputToken.address as `0x${string}`,
                    amountIn: amountInWei,
                    fee: feeTier,
                    sqrtPriceLimitX96: 0n
                }],
            });
            // QuoterV2 returns (amountOut, sqrtPriceX96After, initializedTicksCrossed, gasEstimate)
            quoteAmount = result[0];
        } else {
            // V2 Quote using V2 Router
            const result = await publicClient.readContract({
                address: PLUNDERSWAP_V2_ROUTER,
                abi: PLUNDERSWAP_V2_ROUTER_ABI,
                functionName: "getAmountsOut",
                args: [
                    amountInWei,
                    [inputToken.address as `0x${string}`, outputToken.address as `0x${string}`]
                ],
            });
            // getAmountsOut returns uint256[] array, last element is output
            quoteAmount = result[result.length - 1];
        }

        if (!cancelled) {
          const formatted = formatUnits(quoteAmount, outputToken.decimals);
          setQuote(formatted);
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error("Quote fetch error:", err);
          setQuote(null);
          setQuoteError(err?.message?.includes("reverted") ? "Insufficient liquidity" : "Failed to fetch quote");
        }
      } finally {
        if (!cancelled) setIsFetchingQuote(false);
      }
    };

    const timeoutId = setTimeout(fetchQuote, 500); // 500ms debounce

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [amount, activeTab, inputToken, outputToken, publicClient, isV3, feeTier]);

  // Check Allowance
  const { data: allowance } = useReadContract({
    address: inputToken.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: [
      (userAddress ?? "0x0000000000000000000000000000000000000000") as `0x${string}`,
      PLUNDERSWAP_SMART_ROUTER,
    ],
    query: {
      enabled: !!userAddress && !!amount,
    },
  });

  const parsedAmount = amount && !Number.isNaN(Number(amount)) && Number(amount) > 0
    ? parseUnits(amount, inputToken.decimals)
    : 0n;

  const needsApproval = !isNativeInput && parsedAmount > 0n && (allowance ?? 0n) < parsedAmount;
  const insufficientBalance = parsedAmount > (balanceData?.value ?? 0n);

  // Handle Transaction Success
  React.useEffect(() => {
    if (txReceipt?.status === "success") {
        // Reset amount or show success message
        setAmount("");
        setQuote(null);
        refetchBalance();
    }
  }, [txReceipt, refetchBalance]);

  const handleApprove = async () => {
    if (!isConnected) {
      if (openConnectModal) openConnectModal();
      return;
    }

    try {
      setSwapError(null);
      setIsApproving(true);

      const tx = await writeContractAsync({
        address: inputToken.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [
          PLUNDERSWAP_SMART_ROUTER,
          parsedAmount, // Approve exact amount
        ],
      });

      setTxHash(tx);
    } catch (err: any) {
      setSwapError(err?.shortMessage || err?.message || "Approval failed");
    } finally {
      setIsApproving(false);
    }
  };

  const handleSwap = async () => {
    if (!isConnected) {
      if (openConnectModal) openConnectModal();
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setSwapError("Enter an amount");
      return;
    }

    if (!quote) {
        setSwapError("No quote available");
        return;
    }

    try {
      setSwapError(null);
      setIsSwapping(true);
      
      const amountInWei = parseUnits(amount, inputToken.decimals);
      const amountOutWei = parseUnits(quote, outputToken.decimals);
      
      // Calculate min output with slippage
      const slippageNum = Number(slippage) || 0.5;
      const minAmountOut = amountOutWei * BigInt(Math.floor((100 - slippageNum) * 100)) / 10000n;
      
      // Deadline
      const deadlineSeconds = BigInt(Math.floor(Date.now() / 1000) + (Number(deadline) * 60));

      let tx: `0x${string}`;

      if (isV3) {
         // V3 Swap via SmartRouter (exactInputSingle)
         tx = await writeContractAsync({
            address: PLUNDERSWAP_SMART_ROUTER,
            abi: PLUNDERSWAP_SMART_ROUTER_ABI,
            functionName: "exactInputSingle",
            args: [{
                tokenIn: inputToken.address as `0x${string}`,
                tokenOut: outputToken.address as `0x${string}`,
                fee: feeTier,
                recipient: userAddress as `0x${string}`,
                amountIn: amountInWei,
                amountOutMinimum: minAmountOut,
                sqrtPriceLimitX96: 0n
            }],
            value: isNativeInput ? amountInWei : 0n, 
          });
      } else {
          // V2 Swap via SmartRouter (swapExactTokensForTokens)
          tx = await writeContractAsync({
            address: PLUNDERSWAP_SMART_ROUTER,
            abi: PLUNDERSWAP_SMART_ROUTER_ABI,
            functionName: "swapExactTokensForTokens",
            args: [
                amountInWei,
                minAmountOut,
                [inputToken.address as `0x${string}`, outputToken.address as `0x${string}`],
                userAddress as `0x${string}`
            ],
            value: isNativeInput ? amountInWei : 0n,
          });
      }

      setTxHash(tx);
    } catch (err: any) {
      setSwapError(err?.shortMessage || err?.message || "Swap failed");
    } finally {
      setIsSwapping(false);
    }
  };

  const isBusy = isFetchingQuote || isApproving || isSwapping || isWaitingForTx;

  const getButtonLabel = () => {
    if (!isConnected) return "Connect Wallet";
    if (!amount || Number(amount) <= 0) return activeTab === "buy" ? "Buy" : "Sell";
    if (insufficientBalance) return "Insufficient Balance";
    if (isFetchingQuote) return "Fetching quote...";
    if (needsApproval) return isApproving ? `Approving ${inputToken.symbol}...` : `Approve ${inputToken.symbol}`;
    if (isSwapping || isWaitingForTx) return activeTab === "buy" ? "Buying..." : "Selling...";
    return activeTab === "buy" ? "Buy" : "Sell";
  };

  const onPrimaryClick = async () => {
    if (!isConnected) {
      if (openConnectModal) openConnectModal();
      return;
    }
    
    if (!amount || Number(amount) <= 0 || insufficientBalance) return;

    if (needsApproval) {
      await handleApprove();
    } else {
      await handleSwap();
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-sm">
      {/* Tabs */}
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted/50 p-1">
        <button
          type="button"
          onClick={() => setActiveTab("buy")}
          className={cn(
            "flex items-center justify-center gap-2 rounded-md py-1.5 text-sm font-medium transition-all",
            activeTab === "buy"
              ? "bg-background text-emerald-500 shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Zap size={16} className={cn(activeTab === "buy" && "fill-current")} />
          Buy
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("sell")}
          className={cn(
            "flex items-center justify-center gap-2 rounded-md py-1.5 text-sm font-medium transition-all",
            activeTab === "sell"
              ? "bg-background text-rose-500 shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Tag size={16} className={cn(activeTab === "sell" && "fill-current")} />
          Sell
        </button>
      </div>

      {/* Amount Presets */}
      <div className="grid grid-cols-3 gap-2">
        {activeTab === "buy"
          ? presets.map((val) => (
              <Button
                key={val}
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setAmount(val)}
              >
                <TokenIcon address={quoteToken.address} alt={quoteToken.symbol} size={12} className="mr-1.5" />
                {val}
              </Button>
            ))
          : presets.map((val) => (
              <Button
                key={val}
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                    if (balanceData) {
                        const percentage = BigInt(val);
                        let amount = (balanceData.value * percentage) / 100n;
                        if (isNativeInput && val === "100") {
                             // Leave 5 ZIL for gas only on 100%
                            const fiveZil = parseUnits("5", 18);
                            amount = amount - fiveZil;
                        }
                        setAmount(amount > 0n ? formatUnits(amount, inputToken.decimals) : "0");
                    }
                }}
              >
                {val}%
              </Button>
            ))}
      </div>

      {/* Input */}
      <div className="space-y-2">
        <div className="flex justify-between px-1 text-xs">
            <span className="font-medium text-muted-foreground">Pay</span>
            {isConnected && (
                <button 
                    type="button"
                    className="text-muted-foreground hover:text-foreground transition-colors" 
                    onClick={handleMaxBalance}
                >
                    Balance: {formatNumber(Number(balance), 4)}
                </button>
            )}
        </div>
        <div className="relative">
            <div className="absolute left-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full bg-muted px-2 py-1">
                <TokenIcon address={inputToken.address} alt={inputToken.symbol} size={16} />
                <span className="text-xs font-bold">{inputToken.symbol}</span>
            </div>
            </div>
            <Input
            className="h-12 pl-32 pr-4 text-right font-mono text-lg"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            />
        </div>
      </div>

      {/* Quote / Output */}
      <div className="-mt-2 rounded-lg border bg-muted/50 p-3 text-sm">
        <div className="flex items-center justify-between">
            <span className="text-muted-foreground">You will receive</span>
            <div className="flex items-center gap-2 font-medium">
                {isFetchingQuote ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                    <span>{quote ? `~ ${formatNumber(Number(quote), 4)}` : "-"}</span>
                )}
                <div className="flex items-center gap-1">
                    <TokenIcon address={outputToken.address} alt={outputToken.symbol} size={16} />
                    <span>{outputToken.symbol}</span>
                </div>
            </div>
        </div>
        {quoteError && (
            <div className="mt-2 text-center text-xs text-rose-500">
                {quoteError === "Execution reverted" ? "Insufficient liquidity" : "Failed to fetch quote"}
            </div>
        )}
      </div>

      {/* Advanced Settings */}
      <div className="border-t pt-2">
        <button
          type="button"
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          className="flex w-full items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <Settings size={14} />
          <span>Advanced Settings</span>
          <ChevronDown 
            size={14} 
            className={cn("ml-auto transition-transform", isSettingsOpen && "rotate-180")} 
          />
        </button>

        {isSettingsOpen && (
            <div className="mt-3 space-y-3 animate-in slide-in-from-top-2 fade-in-0">
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-medium">Slippage Tolerance</label>
                        <span className="text-xs text-muted-foreground">{slippage}%</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {["0.1", "0.5", "1.0", "custom"].map((val) => (
                            <Button
                                key={val}
                                variant={slippage === val || (val === "custom" && !["0.1", "0.5", "1.0"].includes(slippage)) ? "secondary" : "outline"}
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => {
                                    if (val !== "custom") setSlippage(val);
                                }}
                            >
                                {val === "custom" ? "Custom" : `${val}%`}
                            </Button>
                        ))}
                    </div>
                    {!["0.1", "0.5", "1.0"].includes(slippage) && (
                        <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-1">
                            <Input 
                                className="h-6 border-0 bg-transparent p-0 text-right text-xs focus-visible:ring-0"
                                value={slippage}
                                onChange={(e) => setSlippage(e.target.value)}
                                placeholder="Custom slippage"
                            />
                            <span className="text-xs text-muted-foreground">%</span>
                        </div>
                    )}
                </div>

                <div className="space-y-1.5">
                     <div className="flex items-center justify-between">
                        <label className="text-xs font-medium">Transaction Deadline</label>
                        <span className="text-xs text-muted-foreground">{deadline}m</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Input 
                            className="h-8 text-sm"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                            type="number"
                        />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">minutes</span>
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* Error Display */}
      {swapError && (
        <div className="rounded-md bg-rose-50 p-2 text-xs text-rose-500 dark:bg-rose-950/50">
            {swapError}
        </div>
      )}

      {/* Action Button */}
      <Button
        size="lg"
        onClick={onPrimaryClick}
        disabled={isBusy || (!isConnected && !openConnectModal)}
        className={cn(
          "w-full font-semibold shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]",
          activeTab === "buy"
            ? "bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700"
            : "bg-rose-500 hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700"
        )}
      >
        {getButtonLabel()}
      </Button>
    </div>
  );
}
