"use client";

import { useConnectModal } from "@rainbow-me/rainbowkit";
import { ArrowDown, ArrowLeftRight, Settings, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import { encodeFunctionData, formatUnits, parseUnits } from "viem";
import {
  useAccount,
  useBalance,
  usePublicClient,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

import { TokenIcon } from "@/components/token-icon";
import { TokenSelector } from "@/components/token-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ERC20_ABI,
  PLUNDERSWAP_QUOTER_V2,
  PLUNDERSWAP_QUOTER_V2_ABI,
  PLUNDERSWAP_V2_ROUTER,
  PLUNDERSWAP_V2_ROUTER_ABI,
  PLUNDERSWAP_SMART_ROUTER,
  PLUNDERSWAP_SMART_ROUTER_ABI,
} from "@/lib/abis";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Token, Pair, fetchTokenPairs } from "@/lib/zilstream";

const WZIL_ADDRESS = "0x94e18aE7dd5eE57B55f30c4B63E2760c09EFb192" as `0x${string}`;

interface DexSwapProps {
  initialTokens: Token[];
}

export function DexSwap({ initialTokens }: DexSwapProps) {
  const [tokenIn, setTokenIn] = React.useState<Token | undefined>(
    initialTokens.find((t) => t.symbol === "ZIL" || t.symbol === "WZIL") ||
      initialTokens[0],
  );
  const [tokenOut, setTokenOut] = React.useState<Token | undefined>(
    initialTokens.find((t) => t.symbol === "USDC" || t.name?.includes("USD Coin")) || 
    initialTokens.find((t) => t.symbol === "USDT") || 
    initialTokens[1],
  );
  
  const [pair, setPair] = React.useState<Pair | null>(null);
  const [isFindingPair, setIsFindingPair] = React.useState(false);

  const [amount, setAmount] = React.useState("");
  const [exactField, setExactField] = React.useState<"in" | "out">("in");
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [slippage, setSlippage] = React.useState("0.5");
  const [deadline, setDeadline] = React.useState("20");
  const router = useRouter();

  const [quote, setQuote] = React.useState<string | null>(null);
  const [isFetchingQuote, setIsFetchingQuote] = React.useState(false);
  const [quoteError, setQuoteError] = React.useState<string | null>(null);

  const [isApproving, setIsApproving] = React.useState(false);
  const [isSwapping, setIsSwapping] = React.useState(false);
  const [txHash, setTxHash] = React.useState<`0x${string}` | null>(null);
  const [txType, setTxType] = React.useState<"approve" | "swap" | null>(null);
  const [swapError, setSwapError] = React.useState<string | null>(null);

  const { isConnected, address: userAddress } = useAccount();
  const { openConnectModal } = useConnectModal();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const { data: txReceipt, isLoading: isWaitingForTx } =
    useWaitForTransactionReceipt({
      hash: txHash || undefined,
    });

  // Find Pair
  React.useEffect(() => {
    const findPair = async () => {
      if (!tokenIn || !tokenOut || tokenIn.address === tokenOut.address) {
        setPair(null);
        return;
      }

      setIsFindingPair(true);
      try {
        // Fetch pairs for tokenIn
        // Note: calling fetchTokenPairs from client. 
        // Assuming API allows it. If strict CORS or server-only, this might fail.
        // Ideally we'd use a server action or route handler, but trying direct first.
        const response = await fetchTokenPairs(tokenIn.address, 1, 100);
        const found = response.data.find(
          (p) =>
            (p.token0 === tokenIn.address && p.token1 === tokenOut.address) ||
            (p.token0 === tokenOut.address && p.token1 === tokenIn.address),
        );
        setPair(found || null);
      } catch (err) {
        console.error("Error finding pair:", err);
        setPair(null);
      } finally {
        setIsFindingPair(false);
      }
    };

    findPair();
  }, [tokenIn, tokenOut]);

  // Identify Protocol
  const isV3 = React.useMemo(
    () => pair?.protocol === "PlunderSwap V3",
    [pair],
  );

  const feeTier = React.useMemo(() => {
    return pair?.fee ? Number(pair.fee) : 2500;
  }, [pair]);

  // Check if input is WZIL (treat as native ZIL)
  const isNativeInput =
    tokenIn?.address.toLowerCase() === WZIL_ADDRESS.toLowerCase();

  // Fetch Balance
  const { data: balanceData, refetch: refetchBalance } = useBalance({
    address: userAddress,
    token: isNativeInput ? undefined : (tokenIn?.address as `0x${string}`),
    query: {
      enabled: !!userAddress && !!tokenIn,
    },
  });

  const balance = balanceData ? balanceData.formatted : "0";

  // Fetch Quote
  React.useEffect(() => {
    setQuote(null);
    setQuoteError(null);

    if (
      !pair ||
      !tokenIn ||
      !tokenOut ||
      !amount ||
      Number.isNaN(Number(amount)) ||
      Number(amount) <= 0
    ) {
      return;
    }

    let cancelled = false;

    const fetchQuote = async () => {
      if (!publicClient) return;

      try {
        setIsFetchingQuote(true);
        setQuoteError(null);

        const decimals = exactField === "in" ? tokenIn.decimals || 18 : tokenOut.decimals || 18;
        const amountBigInt = parseUnits(amount, decimals);

        let quoteAmount: bigint;

        if (isV3) {
            if (exactField === "in") {
                const result = await publicClient.readContract({
                    address: PLUNDERSWAP_QUOTER_V2,
                    abi: PLUNDERSWAP_QUOTER_V2_ABI,
                    functionName: "quoteExactInputSingle",
                    args: [
                      {
                        tokenIn: tokenIn.address as `0x${string}`,
                        tokenOut: tokenOut.address as `0x${string}`,
                        amountIn: amountBigInt,
                        fee: feeTier,
                        sqrtPriceLimitX96: 0n,
                      },
                    ],
                  });
                  quoteAmount = result[0];
            } else {
                 const result = await publicClient.readContract({
                    address: PLUNDERSWAP_QUOTER_V2,
                    abi: PLUNDERSWAP_QUOTER_V2_ABI,
                    functionName: "quoteExactOutputSingle",
                    args: [
                      {
                        tokenIn: tokenIn.address as `0x${string}`,
                        tokenOut: tokenOut.address as `0x${string}`,
                        amount: amountBigInt,
                        fee: feeTier,
                        sqrtPriceLimitX96: 0n,
                      },
                    ],
                  });
                  quoteAmount = result[0];
            }
        } else {
          // V2
          if (exactField === "in") {
              const result = await publicClient.readContract({
                address: PLUNDERSWAP_V2_ROUTER,
                abi: PLUNDERSWAP_V2_ROUTER_ABI,
                functionName: "getAmountsOut",
                args: [
                  amountBigInt,
                  [
                    tokenIn.address as `0x${string}`,
                    tokenOut.address as `0x${string}`,
                  ],
                ],
              });
              quoteAmount = result[result.length - 1];
          } else {
              const result = await publicClient.readContract({
                address: PLUNDERSWAP_V2_ROUTER,
                abi: PLUNDERSWAP_V2_ROUTER_ABI,
                functionName: "getAmountsIn",
                args: [
                  amountBigInt,
                  [
                    tokenIn.address as `0x${string}`,
                    tokenOut.address as `0x${string}`,
                  ],
                ],
              });
              quoteAmount = result[0];
          }
        }

        if (!cancelled) {
          const targetDecimals = exactField === "in" ? tokenOut.decimals || 18 : tokenIn.decimals || 18;
          const formatted = formatUnits(quoteAmount, targetDecimals);
          setQuote(formatted);
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error("Quote fetch error:", err);
          setQuote(null);
          setQuoteError(
            err?.message?.includes("reverted")
              ? "Insufficient liquidity"
              : "Failed to fetch quote",
          );
        }
      } finally {
        if (!cancelled) setIsFetchingQuote(false);
      }
    };

    const timeoutId = setTimeout(fetchQuote, 500);
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [amount, exactField, tokenIn, tokenOut, pair, isV3, feeTier, publicClient]);

  // Allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: tokenIn?.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: [
      (userAddress ??
        "0x0000000000000000000000000000000000000000") as `0x${string}`,
      PLUNDERSWAP_SMART_ROUTER,
    ],
    query: {
      enabled: !!userAddress && !!amount && !!tokenIn,
    },
  });

  const parsedAmount = React.useMemo(() => {
      if (!amount || !tokenIn || Number.isNaN(Number(amount)) || Number(amount) <= 0) return 0n;
      if (exactField === "in") {
          return parseUnits(amount, tokenIn.decimals || 18);
      }
      // If exact output, we need the *input* amount (which is the quote) for approval
      if (!quote) return 0n;
      return parseUnits(quote, tokenIn.decimals || 18);
  }, [amount, tokenIn, exactField, quote]);

  const needsApproval =
    !isNativeInput && parsedAmount > 0n && (allowance ?? 0n) < parsedAmount;
  const insufficientBalance = parsedAmount > (balanceData?.value ?? 0n);

  // TX Success Handling
  React.useEffect(() => {
    if (txReceipt?.status === "success") {
      if (txType === "approve") {
        toast.success(`Successfully approved ${tokenIn?.symbol}`);
        refetchAllowance();
        setTxHash(null);
        setTxType(null);
      } else if (txType === "swap") {
        const inputVal = exactField === "in" ? amount : quote;
        const outputVal = exactField === "out" ? amount : quote;
        
        const inAmount = formatNumber(Number(inputVal), 4);
        const outAmount = formatNumber(Number(outputVal), 4);
        
        setAmount("");
        setQuote(null);
        refetchBalance();
        setTxHash(null);
        setTxType(null);

        toast.success(
          `Successfully swapped ${inAmount} ${tokenIn?.symbol} for ${outAmount} ${tokenOut?.symbol}`,
          {
            action: {
              label: "View Transaction",
              onClick: () => router.push(`/tx/${txReceipt.transactionHash}`),
            },
          },
        );
      }
    }
  }, [txReceipt, txType, refetchBalance, refetchAllowance, amount, quote, tokenIn, tokenOut, router]);

  const handleApprove = async () => {
    if (!isConnected || !tokenIn) {
      if (openConnectModal) openConnectModal();
      return;
    }

    try {
      setSwapError(null);
      setIsApproving(true);

      const tx = await writeContractAsync({
        address: tokenIn.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [PLUNDERSWAP_SMART_ROUTER, parsedAmount],
      });

      setTxHash(tx);
      setTxType("approve");
    } catch (err: any) {
      setSwapError(err?.shortMessage || err?.message || "Approval failed");
    } finally {
      setIsApproving(false);
    }
  };

  const handleSwap = async () => {
    if (!isConnected || !userAddress) {
      if (openConnectModal) openConnectModal();
      return;
    }
    if (!amount || Number(amount) <= 0 || !tokenIn || !tokenOut || !quote) {
      return;
    }

    try {
      setSwapError(null);
      setIsSwapping(true);

      const inputVal = exactField === "in" ? amount : quote;
      const outputVal = exactField === "out" ? amount : quote;

      if (!inputVal || !outputVal) throw new Error("Missing amounts");

      const amountInWei = parseUnits(inputVal, tokenIn.decimals || 18);
      const amountOutWei = parseUnits(outputVal, tokenOut.decimals || 18);

      const slippageNum = Number(slippage) || 0.5;
      
      // Calculate min/max with slippage
      // If exact input: minAmountOut = amountOut * (1 - slippage)
      // If exact output: maxAmountIn = amountIn * (1 + slippage)
      
      let minAmountOut = 0n;
      let maxAmountIn = 0n;

      if (exactField === "in") {
          minAmountOut = (amountOutWei * BigInt(Math.floor((100 - slippageNum) * 100))) / 10000n;
      } else {
          maxAmountIn = (amountInWei * BigInt(Math.floor((100 + slippageNum) * 100))) / 10000n;
      }

      const deadlineMin = Number(deadline) || 20;
      const deadlineTimestamp = BigInt(
        Math.floor(Date.now() / 1000) + deadlineMin * 60,
      );

      let functionName = "";
      let args: any[] = [];
      let value = 0n;

      const isNativeOutput =
        tokenOut.address.toLowerCase() === WZIL_ADDRESS.toLowerCase();

      if (isV3) {
        if (isNativeInput) {
          if (exactField === "in") {
              functionName = "exactInputSingle";
              args = [
                {
                  tokenIn: WZIL_ADDRESS,
                  tokenOut: tokenOut.address as `0x${string}`,
                  fee: feeTier,
                  recipient: userAddress,
                  amountIn: amountInWei,
                  amountOutMinimum: minAmountOut,
                  sqrtPriceLimitX96: 0n,
                },
              ];
              value = amountInWei;
          } else {
              functionName = "exactOutputSingle";
              args = [
                {
                  tokenIn: WZIL_ADDRESS,
                  tokenOut: tokenOut.address as `0x${string}`,
                  fee: feeTier,
                  recipient: userAddress,
                  amountOut: amountOutWei,
                  amountInMaximum: maxAmountIn,
                  sqrtPriceLimitX96: 0n,
                },
              ];
              value = maxAmountIn; // Need to send max amount for exact output with ETH
          }
        } else if (isNativeOutput) {
          // Multicall for output unwrap
          let swapCallData: `0x${string}`;
          
          if (exactField === "in") {
               swapCallData = encodeFunctionData({
                abi: PLUNDERSWAP_SMART_ROUTER_ABI,
                functionName: "exactInputSingle",
                args: [
                  {
                    tokenIn: tokenIn.address as `0x${string}`,
                    tokenOut: WZIL_ADDRESS,
                    fee: feeTier,
                    recipient: PLUNDERSWAP_SMART_ROUTER,
                    amountIn: amountInWei,
                    amountOutMinimum: minAmountOut,
                    sqrtPriceLimitX96: 0n,
                  },
                ],
              });
          } else {
              swapCallData = encodeFunctionData({
                abi: PLUNDERSWAP_SMART_ROUTER_ABI,
                functionName: "exactOutputSingle",
                args: [
                  {
                    tokenIn: tokenIn.address as `0x${string}`,
                    tokenOut: WZIL_ADDRESS,
                    fee: feeTier,
                    recipient: PLUNDERSWAP_SMART_ROUTER,
                    amountOut: amountOutWei,
                    amountInMaximum: maxAmountIn,
                    sqrtPriceLimitX96: 0n,
                  },
                ],
              });
          }

          // For exact output, the amount we eventually receive (and unwrap) is exactly amountOutWei
          // For exact input, it's >= minAmountOut. 
          // Standard practice for unwrap is to unwrap exact amount received or min amount expected.
          // But `unwrapWETH9` takes amountMinimum.
          // If exact output, we expect exactly amountOutWei.
          const unwrapAmount = exactField === "in" ? minAmountOut : amountOutWei;

          const unwrapData = encodeFunctionData({
            abi: PLUNDERSWAP_SMART_ROUTER_ABI,
            functionName: "unwrapWETH9",
            args: [unwrapAmount, userAddress],
          });
          functionName = "multicall";
          args = [deadlineTimestamp, [swapCallData, unwrapData]];
          value = 0n;
        } else {
          // ERC20 -> ERC20
          if (exactField === "in") {
              functionName = "exactInputSingle";
              args = [
                {
                  tokenIn: tokenIn.address as `0x${string}`,
                  tokenOut: tokenOut.address as `0x${string}`,
                  fee: feeTier,
                  recipient: userAddress,
                  amountIn: amountInWei,
                  amountOutMinimum: minAmountOut,
                  sqrtPriceLimitX96: 0n,
                },
              ];
          } else {
              functionName = "exactOutputSingle";
              args = [
                {
                  tokenIn: tokenIn.address as `0x${string}`,
                  tokenOut: tokenOut.address as `0x${string}`,
                  fee: feeTier,
                  recipient: userAddress,
                  amountOut: amountOutWei,
                  amountInMaximum: maxAmountIn,
                  sqrtPriceLimitX96: 0n,
                },
              ];
          }
          value = 0n;
        }
      } else {
        // V2
        const path = [tokenIn.address as `0x${string}`, tokenOut.address as `0x${string}`];
        if (isNativeInput) {
           const calls: `0x${string}`[] = [];
           // Wrap max input amount (for exact output) or exact input amount
           const ethAmount = exactField === "in" ? amountInWei : maxAmountIn;

           calls.push(
             encodeFunctionData({
               abi: PLUNDERSWAP_SMART_ROUTER_ABI,
               functionName: "wrapETH",
               args: [ethAmount],
             }),
           );

           if (exactField === "in") {
               calls.push(
                encodeFunctionData({
                  abi: PLUNDERSWAP_SMART_ROUTER_ABI,
                  functionName: "swapExactTokensForTokens",
                  args: [
                    ethAmount, // amountIn
                    minAmountOut,
                    path,
                    isNativeOutput ? PLUNDERSWAP_SMART_ROUTER : userAddress,
                  ],
                }),
              );
           } else {
               calls.push(
                encodeFunctionData({
                  abi: PLUNDERSWAP_SMART_ROUTER_ABI,
                  functionName: "swapTokensForExactTokens",
                  args: [
                    amountOutWei,
                    ethAmount, // amountInMax
                    path,
                    isNativeOutput ? PLUNDERSWAP_SMART_ROUTER : userAddress,
                  ],
                }),
              );
           }
          
          if (isNativeOutput) {
            calls.push(
              encodeFunctionData({
                abi: PLUNDERSWAP_SMART_ROUTER_ABI,
                functionName: "unwrapWETH9",
                args: [exactField === "in" ? minAmountOut : amountOutWei, userAddress],
              }),
            );
          }
          calls.push(
            encodeFunctionData({
              abi: PLUNDERSWAP_SMART_ROUTER_ABI,
              functionName: "refundETH",
              args: [],
            }),
          );
          functionName = "multicall";
          args = [deadlineTimestamp, calls];
          value = ethAmount;
        } else if (isNativeOutput) {
           const calls: `0x${string}`[] = [];
           
           if (exactField === "in") {
               calls.push(
                 encodeFunctionData({
                   abi: PLUNDERSWAP_SMART_ROUTER_ABI,
                   functionName: "swapExactTokensForTokens",
                   args: [amountInWei, minAmountOut, path, PLUNDERSWAP_SMART_ROUTER],
                 }),
               );
           } else {
               calls.push(
                 encodeFunctionData({
                   abi: PLUNDERSWAP_SMART_ROUTER_ABI,
                   functionName: "swapTokensForExactTokens",
                   args: [amountOutWei, maxAmountIn, path, PLUNDERSWAP_SMART_ROUTER],
                 }),
               );
           }

           calls.push(
             encodeFunctionData({
               abi: PLUNDERSWAP_SMART_ROUTER_ABI,
               functionName: "unwrapWETH9",
               args: [exactField === "in" ? minAmountOut : amountOutWei, userAddress],
             }),
           );
           functionName = "multicall";
           args = [deadlineTimestamp, calls];
           value = 0n;
        } else {
          if (exactField === "in") {
              functionName = "swapExactTokensForTokens";
              args = [amountInWei, minAmountOut, path, userAddress];
          } else {
              functionName = "swapTokensForExactTokens";
              args = [amountOutWei, maxAmountIn, path, userAddress];
          }
          value = 0n;
        }
      }

      const tx = await writeContractAsync({
        address: PLUNDERSWAP_SMART_ROUTER,
        abi: PLUNDERSWAP_SMART_ROUTER_ABI,
        functionName: functionName as any,
        args: args as any,
        value,
      });

      setTxHash(tx);
      setTxType("swap");
    } catch (err: any) {
      setSwapError(err?.shortMessage || err?.message || "Swap failed");
    } finally {
      setIsSwapping(false);
    }
  };

  const switchTokens = () => {
    setTokenIn(tokenOut);
    setTokenOut(tokenIn);
    setAmount("");
    setQuote(null);
  };

  const handleMaxBalance = () => {
    if (!balanceData) return;
    if (isNativeInput) {
      const fiveZil = parseUnits("5", 18);
      const maxVal = balanceData.value - fiveZil;
      setAmount(maxVal > 0n ? formatUnits(maxVal, 18) : "0");
    } else {
      setAmount(balanceData.formatted);
    }
  };

  const getTokenSymbol = (token?: Token) => {
      if (!token) return "";
      if (token.address.toLowerCase() === WZIL_ADDRESS.toLowerCase()) return "ZIL";
      return token.symbol;
  };

  const onInputAmountChange = (val: string) => {
      setAmount(val);
      setExactField("in");
  };

  const onOutputAmountChange = (val: string) => {
      setAmount(val);
      setExactField("out");
  };

  const formatQuote = (val: string | null) => {
      if (!val) return "";
      const num = Number(val);
      if (Number.isNaN(num)) return "";
      if (num === 0) return "0";
      
      if (num < 0.000001) {
          return num.toString();
      }
      
      if (num < 1) {
          return parseFloat(num.toFixed(8)).toString();
      }
      
      if (num < 10) {
          return parseFloat(num.toFixed(4)).toString();
      }

      if (num < 10000) {
          return parseFloat(num.toFixed(2)).toString();
      }

      if (num < 100000) {
          return parseFloat(num.toFixed(1)).toString();
      }
      
      return parseFloat(num.toFixed(0)).toString();
  };

  const inputDisplay = exactField === "in" ? amount : formatQuote(quote);
  const outputDisplay = exactField === "out" ? amount : formatQuote(quote);

  return (
    <div className="mx-auto w-full max-w-md space-y-4 rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Swap</h2>
        <div className="flex items-center gap-2">
            <button
                type="button"
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="text-muted-foreground hover:text-foreground"
            >
                <Settings size={18} />
            </button>
        </div>
      </div>

       {isSettingsOpen && (
          <div className="mb-4 space-y-3 rounded-lg border p-3 text-sm animate-in slide-in-from-top-2 fade-in-0">
             <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Slippage Tolerance</span>
                <Input 
                    className="h-6 w-16 text-right"
                    value={slippage}
                    onChange={e => setSlippage(e.target.value)}
                />
             </div>
             <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Deadline (minutes)</span>
                <Input 
                    className="h-6 w-16 text-right"
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                />
             </div>
          </div>
       )}

      {/* Token In */}
      <div className="space-y-2 rounded-xl bg-muted/40 p-4">
         <div className="flex justify-between text-xs font-medium text-muted-foreground">
            <span>Pay</span>
            {isConnected && (
                <button onClick={handleMaxBalance} className="hover:text-foreground">
                    Balance: {formatNumber(Number(balance), 4)}
                </button>
            )}
         </div>
         <div className="flex items-center gap-3">
            <TokenSelector 
                tokens={initialTokens} 
                selectedToken={tokenIn} 
                onSelect={setTokenIn}
                trigger={
                   <button className="flex items-center gap-2 rounded-full bg-background px-3 py-1.5 font-semibold shadow-sm hover:bg-accent transition-colors">
                      {tokenIn ? (
                        <>
                           <TokenIcon address={tokenIn.address} alt={getTokenSymbol(tokenIn) || "T"} size={24} />
                           <span>{getTokenSymbol(tokenIn)}</span>
                        </>
                      ) : "Select"}
                      <ArrowDown size={14} className="opacity-50" />
                   </button>
                }
            />
            {exactField === "out" && isFetchingQuote ? (
                 <div className="flex-1 flex justify-end">
                    <Loader2 className="animate-spin text-muted-foreground" size={24} />
                 </div>
            ) : (
                <Input 
                    className="h-auto w-full min-w-0 border-0 bg-transparent p-0 text-right text-3xl font-medium shadow-none outline-none focus-visible:ring-0 disabled:opacity-100 placeholder:text-muted-foreground/50 md:text-3xl"
                    placeholder="0.0"
                    value={inputDisplay}
                    onChange={e => onInputAmountChange(e.target.value)}
                />
            )}
         </div>
      </div>

      {/* Switch Button */}
      <div className="relative flex h-4 items-center justify-center">
          <div className="absolute rounded-full border bg-background p-1.5 shadow-sm cursor-pointer hover:scale-110 transition-transform" onClick={switchTokens}>
             <ArrowDown size={16} />
          </div>
      </div>

      {/* Token Out */}
      <div className="space-y-2 rounded-xl bg-muted/40 p-4">
         <div className="flex justify-between text-xs font-medium text-muted-foreground">
            <span>Receive</span>
            <span>{quote ? `≈ ${formatNumber(Number(quote) * Number(tokenOut?.priceUsd || 0), 2)} USD` : ""}</span>
         </div>
         <div className="flex items-center gap-3">
            <TokenSelector 
                tokens={initialTokens} 
                selectedToken={tokenOut} 
                onSelect={setTokenOut}
                trigger={
                    <button className="flex items-center gap-2 rounded-full bg-background px-3 py-1.5 font-semibold shadow-sm hover:bg-accent transition-colors">
                       {tokenOut ? (
                         <>
                            <TokenIcon address={tokenOut.address} alt={getTokenSymbol(tokenOut) || "T"} size={24} />
                            <span>{getTokenSymbol(tokenOut)}</span>
                         </>
                       ) : "Select"}
                       <ArrowDown size={14} className="opacity-50" />
                    </button>
                 }
            />
            {exactField === "in" && isFetchingQuote ? (
                 <div className="flex-1 flex justify-end">
                    <Loader2 className="animate-spin text-muted-foreground" size={24} />
                 </div>
            ) : (
                <Input 
                    className="h-auto w-full min-w-0 border-0 bg-transparent p-0 text-right text-3xl font-medium shadow-none outline-none focus-visible:ring-0 disabled:opacity-100 placeholder:text-muted-foreground/50 md:text-3xl"
                    placeholder="0.0"
                    value={outputDisplay}
                    onChange={e => onOutputAmountChange(e.target.value)}
                />
            )}
         </div>
      </div>

      {/* Price Info */}
      {quote && tokenIn && tokenOut && amount && !isFetchingQuote && (
        <div className="space-y-2 rounded-xl border bg-card p-3 text-sm shadow-sm">
          {(() => {
            const inputAmount = exactField === "in" ? Number(amount) : Number(quote);
            const outputAmount = exactField === "in" ? Number(quote) : Number(amount);
            
            const usdIn = inputAmount * Number(tokenIn.priceUsd || 0);
            const usdOut = outputAmount * Number(tokenOut.priceUsd || 0);
            
            let impactPercentage = 0;
            if (usdIn > 0) {
               impactPercentage = ((usdIn - usdOut) / usdIn) * 100;
            }
            
            // Cap at 0 if negative (due to oracle lag where output is worth more than input)
            // Or should we show negative impact (green)? Usually distinct from positive impact (loss).
            // Let's assume positive impact means loss.
            // If impact is negative (gain), show as 0 or <0.01.
            if (impactPercentage < 0) impactPercentage = 0;

            let impactColor = "text-emerald-500";
            if (impactPercentage >= 5) impactColor = "text-rose-500";
            else if (impactPercentage >= 3) impactColor = "text-orange-500";
            else if (impactPercentage >= 1) impactColor = "text-yellow-500";

            const slippageNum = Number(slippage) || 0.5;
            const minRec = outputAmount * (1 - slippageNum / 100);
            const maxSold = inputAmount * (1 + slippageNum / 100);

            return (
              <div className="space-y-1">
                 <div className="flex justify-between">
                    <span className="text-muted-foreground">Price Impact</span>
                    <span className={cn("font-medium", impactColor)}>
                       {impactPercentage < 0.01 ? "<0.01%" : `${impactPercentage.toFixed(2)}%`}
                    </span>
                 </div>
                 <div className="flex justify-between">
                    <span className="text-muted-foreground">
                        {exactField === "in" ? "Min. Received" : "Max. Sold"}
                    </span>
                    <span className="font-medium text-foreground">
                        {exactField === "in" 
                           ? `${formatNumber(minRec, 4)} ${tokenOut.symbol}`
                           : `${formatNumber(maxSold, 4)} ${tokenIn.symbol}`
                        }
                    </span>
                 </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Info / Error */}
      {isFindingPair && (
          <div className="text-center text-xs text-muted-foreground">
              Finding best route...
          </div>
      )}
      {!isFindingPair && !pair && tokenIn && tokenOut && (
          <div className="rounded-md bg-yellow-50 p-2 text-center text-xs text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400">
             No direct liquidity pair found between these tokens.
          </div>
      )}
      {quoteError && (
        <div className="rounded-md bg-rose-50 p-2 text-center text-xs text-rose-500 dark:bg-rose-950/50">
            {quoteError}
        </div>
      )}
      {swapError && (
        <div className="rounded-md bg-rose-50 p-2 text-center text-xs text-rose-500 dark:bg-rose-950/50">
            {swapError}
        </div>
      )}

      <Button 
         size="lg" 
         className="w-full font-semibold"
         disabled={!tokenIn || !tokenOut || !amount || isApproving || isSwapping || isWaitingForTx || !pair}
         onClick={needsApproval ? handleApprove : handleSwap}
      >
        {!isConnected ? "Connect Wallet" : 
         needsApproval ? (isApproving ? "Approving..." : `Approve ${getTokenSymbol(tokenIn)}`) :
         isSwapping || isWaitingForTx ? "Swapping..." : 
         "Swap"}
      </Button>
    </div>
  );
}
