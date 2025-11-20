"use client";

import * as React from "react";
import { Zap, Tag, Settings, ChevronDown } from "lucide-react";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";
import { TokenIcon } from "@/components/token-icon";
import type { Pair } from "@/lib/zilstream";

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
  
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  // Determine quote token (assuming token1 is quote/native-like for now)
  const quoteToken = { symbol: pair.token1Symbol, address: pair.token1, decimals: token1Decimals };
  const baseToken = { symbol: pair.token0Symbol, address: pair.token0, decimals: token0Decimals };

  const inputToken = activeTab === "buy" ? quoteToken : baseToken;
  const outputToken = activeTab === "buy" ? baseToken : quoteToken;

  // Calculate estimated output with 0.3% fee (Uniswap V2 style)
  const estimatedOutput = React.useMemo(() => {
    if (!amount || Number.isNaN(Number(amount)) || Number(amount) === 0) return null;
    
    const val = Number(amount);
    // Reserves need to be normalized by decimals
    const reserveIn = activeTab === "buy" 
        ? Number(pair.reserve1) / 10 ** quoteToken.decimals
        : Number(pair.reserve0) / 10 ** baseToken.decimals;
        
    const reserveOut = activeTab === "buy"
        ? Number(pair.reserve0) / 10 ** baseToken.decimals
        : Number(pair.reserve1) / 10 ** quoteToken.decimals;
    
    if (!reserveIn || !reserveOut) return null;

    // Formula: dy = (y * dx * 997) / (x * 1000 + dx * 997)
    const amountInWithFee = val * 0.997;
    const numerator = amountInWithFee * reserveOut;
    const denominator = reserveIn + amountInWithFee;
    
    return numerator / denominator;
  }, [amount, pair.reserve0, pair.reserve1, activeTab, quoteToken.decimals, baseToken.decimals]);

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

  const handleQuickAction = () => {
    if (!isConnected && openConnectModal) {
      openConnectModal();
      return;
    }
    // Implement swap logic here
    console.log(`Quick ${activeTab} ${amount} ${inputToken.symbol}`);
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
                // onClick={() => setAmount(...)} // needs balance
              >
                {val}%
              </Button>
            ))}
      </div>

      {/* Input */}
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

      {estimatedOutput !== null && (
        <div className="flex items-center justify-end gap-2 px-1 text-xs text-muted-foreground">
            <span>
            ≈ {formatNumber(estimatedOutput, 4)} {outputToken.symbol}
            </span>
        </div>
      )}

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
                                    // If custom, focus input (implemented below)
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

      {/* Action Button */}
      <Button
        size="lg"
        onClick={handleQuickAction}
        className={cn(
          "w-full font-semibold shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]",
          activeTab === "buy"
            ? "bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700"
            : "bg-rose-500 hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700"
        )}
      >
        {!isConnected ? "Connect Wallet" : (activeTab === "buy" ? "Buy" : "Sell")}
      </Button>
    </div>
  );
}
