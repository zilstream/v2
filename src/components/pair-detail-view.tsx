"use client";

import {
  ArrowRight,
  ExternalLink,
  GripHorizontal,
  Info,
  LineChart,
  List,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AddressDisplay } from "@/components/address-display";
import { ExplorerDropdown } from "@/components/explorer-dropdown";
import { SwapWidget } from "@/components/swap-widget";
import { TokenIcon } from "@/components/token-icon";
import {
  type ChartTrade,
  TradingViewChart,
} from "@/components/tradingview-chart";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePairSubscription } from "@/hooks/use-websocket";
import { PLUNDERSWAP_URL } from "@/lib/constants";
import {
  formatNumber,
  formatPriceUsd,
  formatTimestamp,
  formatTokenAmount,
  formatUsd,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import type { SwapEventData } from "@/lib/websocket-types";
import type { Pair, PairEvent, Token, TokenChartData } from "@/lib/zilstream";

interface PairDetailViewProps {
  initialPair: Pair;
  events: PairEvent[];
  tokens: Token[];
  chartData?: TokenChartData;
}

export function PairDetailView({
  initialPair,
  events: initialEvents,
  tokens,
}: PairDetailViewProps) {
  const [pair, setPair] = useState(initialPair);
  const [events, setEvents] = useState(initialEvents);
  const [lastTrade, setLastTrade] = useState<ChartTrade | null>(null);
  const [activeTab, setActiveTab] = useState<"info" | "chart" | "trades">(
    "info",
  );

  const tokenIndex = new Map(
    tokens.map((token) => [token.address.toLowerCase(), token]),
  );
  const token0Decimals =
    tokenIndex.get(pair.token0.toLowerCase())?.decimals ?? 12;
  const token1Decimals =
    tokenIndex.get(pair.token1.toLowerCase())?.decimals ?? 12;

  usePairSubscription(
    pair.address,
    (updatedPair) => {
      setPair(updatedPair);
    },
    (swapEvent: SwapEventData, eventType: string) => {
      try {
        // 1. Calculate amounts based on version/protocol
        let amount0In = swapEvent.amount0_in;
        let amount1In = swapEvent.amount1_in;
        let amount0Out = swapEvent.amount0_out;
        let amount1Out = swapEvent.amount1_out;

        // Handle Uniswap V3 style events (amount0/amount1)
        // We use string manipulation to preserve precision for large numbers
        const rawAmount0 =
          swapEvent.amount0 !== undefined
            ? String(swapEvent.amount0)
            : undefined;
        const rawAmount1 =
          swapEvent.amount1 !== undefined
            ? String(swapEvent.amount1)
            : undefined;

        if (rawAmount0 && rawAmount1) {
          // V3 Convention:
          // Positive = In to pool (User sold)
          // Negative = Out from pool (User bought)
          if (rawAmount0.startsWith("-")) {
            amount0Out = rawAmount0.slice(1);
            amount0In = undefined;
          } else {
            amount0In = rawAmount0;
            amount0Out = undefined;
          }

          if (rawAmount1.startsWith("-")) {
            amount1Out = rawAmount1.slice(1);
            amount1In = undefined;
          } else {
            amount1In = rawAmount1;
            amount1Out = undefined;
          }
        }

        // 2. Update Events List
        const newEvent: PairEvent = {
          protocol:
            swapEvent.protocol === "uniswap_v3"
              ? "PlunderSwap V3"
              : "PlunderSwap V2",
          eventType: eventType,
          id: swapEvent.id,
          transactionHash: swapEvent.transaction_hash,
          logIndex: Number.parseInt(swapEvent.id.split("-")[1] || "0"),
          blockNumber: 0, // Not available in real-time event
          timestamp: swapEvent.timestamp,
          address: pair.address,
          sender: swapEvent.sender,
          recipient: swapEvent.recipient,
          amount0In,
          amount1In,
          amount0Out,
          amount1Out,
          amountUsd: swapEvent.amount_usd,
          liquidity: swapEvent.liquidity,
          maker: swapEvent.sender, // Approximation
          tokenInAddress: swapEvent.token_in_address,
          tokenInSymbol: swapEvent.token_in_symbol,
          tokenInDecimals: swapEvent.token_in_decimals,
          tokenOutAddress: swapEvent.token_out_address,
          tokenOutSymbol: swapEvent.token_out_symbol,
          tokenOutDecimals: swapEvent.token_out_decimals,
        };

        setEvents((prev) => {
          // Prevent duplicates
          if (prev.some((e) => e.id === newEvent.id)) {
            return prev;
          }
          return [newEvent, ...prev].slice(0, 50);
        });

        // 3. Update Chart (Only for Swaps)
        if (eventType === "swap") {
          // Use token decimals from event directly
          const inDecimals = swapEvent.token_in_decimals ?? 18;
          const outDecimals = swapEvent.token_out_decimals ?? 18;

          // Parse and normalize amounts - use the non-zero value for each position
          let normalizedAmt0 = 0;
          let normalizedAmt1 = 0;

          if (amount0In && amount0In !== "0") {
            normalizedAmt0 = Number.parseFloat(amount0In) / 10 ** inDecimals;
          } else if (amount0Out && amount0Out !== "0") {
            normalizedAmt0 = Number.parseFloat(amount0Out) / 10 ** outDecimals;
          }

          if (amount1In && amount1In !== "0") {
            normalizedAmt1 = Number.parseFloat(amount1In) / 10 ** inDecimals;
          } else if (amount1Out && amount1Out !== "0") {
            normalizedAmt1 = Number.parseFloat(amount1Out) / 10 ** outDecimals;
          }

          // Price = Token1 / Token0
          const price =
            normalizedAmt0 > 0 ? normalizedAmt1 / normalizedAmt0 : 0;

          if (price > 0) {
            setLastTrade({
              timestamp: swapEvent.timestamp,
              price: price,
              volume: Number.parseFloat(swapEvent.amount_usd || "0"),
            });
          }
        }
      } catch (err) {
        console.error("Error processing websocket event:", err);
      }
    },
  );

  // Calculate initial price for chart scaling
  const initialPrice = (() => {
    if (!pair.reserve0 || !pair.reserve1 || pair.reserve0 === "0")
      return undefined;
    const r0 = Number(pair.reserve0) / 10 ** token0Decimals;
    const r1 = Number(pair.reserve1) / 10 ** token1Decimals;
    return r0 > 0 ? (r1 / r0).toString() : undefined;
  })();

  // Resizable logic
  const [chartHeightPercent, setChartHeightPercent] = useState(60);
  const [isDragging, setIsDragging] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current || !contentRef.current) return;

      const containerRect = contentRef.current.getBoundingClientRect();
      const relativeY = e.clientY - containerRect.top;
      const percentage = (relativeY / containerRect.height) * 100;

      // Clamp between 20% and 80%
      const clampedPercentage = Math.min(Math.max(percentage, 20), 80);
      setChartHeightPercent(clampedPercentage);
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      setIsDragging(false);
      document.body.style.cursor = "default";
      document.body.style.userSelect = "";
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    setIsDragging(true);
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
  };

  return (
    <div className="flex h-[calc(100vh-64px)] w-full flex-col overflow-hidden md:flex-row">
      {/* Mobile Tabs */}
      <div className="flex shrink-0 items-center border-b bg-card md:hidden">
        <button
          type="button"
          onClick={() => setActiveTab("info")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors",
            activeTab === "info"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          <Info className="h-4 w-4" />
          Info
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("chart")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors",
            activeTab === "chart"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          <LineChart className="h-4 w-4" />
          Chart
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("trades")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors",
            activeTab === "trades"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          <List className="h-4 w-4" />
          Trades
        </button>
      </div>

      {/* Main Content (Chart + Events) */}
      <div
        ref={contentRef}
        className={cn(
          "flex-1 flex-col min-w-0 bg-background relative",
          activeTab === "info" ? "hidden md:flex" : "flex",
        )}
      >
        {/* Chart Section */}
        <div
          style={
            {
              "--chart-height": `${chartHeightPercent}%`,
            } as React.CSSProperties
          }
          className={cn(
            "w-full min-h-0 bg-card",
            isDragging && "pointer-events-none",
            activeTab === "chart"
              ? "h-full"
              : "hidden md:block md:h-[var(--chart-height)]",
          )}
        >
          <TradingViewChart
            pairAddress={pair.address}
            pairName={`${pair.token0Symbol} / ${pair.token1Symbol}`}
            initialPrice={initialPrice}
            className="h-full border-b border-r"
            lastTrade={lastTrade}
          />
        </div>

        {/* Drag Handle */}
        <div
          className="hidden md:flex h-3 shrink-0 cursor-row-resize items-center justify-center border-b border-r bg-muted/40 hover:bg-primary/10 transition-colors"
          onMouseDown={startResizing}
        >
          <GripHorizontal className="h-4 w-4 text-muted-foreground/50" />
        </div>

        {/* Events Section */}
        <div
          className={cn(
            "flex-1 min-h-0 overflow-auto border-r bg-card",
            activeTab === "trades" ? "block" : "hidden md:block",
          )}
        >
          <div className="sticky top-0 z-10 border-b bg-card px-4 py-2">
            <h3 className="font-semibold leading-none tracking-tight">
              Recent Trades
            </h3>
          </div>
          <div className="p-0">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10 shadow-sm">
                <TableRow className="border-b hover:bg-transparent">
                  <TableHead className="w-24 pl-4">Time</TableHead>
                  <TableHead className="w-16">Type</TableHead>
                  <TableHead className="text-right">
                    {pair.token0Symbol}
                  </TableHead>
                  <TableHead className="text-right">
                    {pair.token1Symbol}
                  </TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Maker</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => {
                  // Get the tokenIn and tokenOut amounts from the event
                  const tokenInAmount =
                    event.amount0In && event.amount0In !== "0"
                      ? event.amount0In
                      : event.amount1In;
                  const tokenOutAmount =
                    event.amount0Out && event.amount0Out !== "0"
                      ? event.amount0Out
                      : event.amount1Out;

                  if (!tokenInAmount && !tokenOutAmount) return null;

                  const eventColor = getEventColor(event);
                  const badgeColor = getBadgeColor(event);

                  // Match pair tokens to event tokenIn/tokenOut by address
                  const pairToken0IsTokenIn =
                    pair.token0.toLowerCase() === event.tokenInAddress?.toLowerCase();
                  const pairToken1IsTokenIn =
                    pair.token1.toLowerCase() === event.tokenInAddress?.toLowerCase();

                  // Assign amounts and decimals based on which pair token matches tokenIn/tokenOut
                  const token0Amount = pairToken0IsTokenIn ? tokenInAmount : tokenOutAmount;
                  const token0Dec = pairToken0IsTokenIn
                    ? (event.tokenInDecimals ?? token0Decimals)
                    : (event.tokenOutDecimals ?? token0Decimals);

                  const token1Amount = pairToken1IsTokenIn ? tokenInAmount : tokenOutAmount;
                  const token1Dec = pairToken1IsTokenIn
                    ? (event.tokenInDecimals ?? token1Decimals)
                    : (event.tokenOutDecimals ?? token1Decimals);

                  const amount0 = token0Amount
                    ? Number(token0Amount) / 10 ** token0Dec
                    : 0;
                  const amount1 = token1Amount
                    ? Number(token1Amount) / 10 ** token1Dec
                    : 0;

                  // Calculate price for this trade
                  // Prefer using USD amount if available for accurate pricing, otherwise fallback to token ratio
                  const price =
                    event.amountUsd && event.amountUsd !== "0" && amount0 > 0
                      ? Number(event.amountUsd) / amount0
                      : amount0 > 0 && amount1 > 0
                        ? amount1 / amount0
                        : 0;

                  return (
                    <TableRow
                      key={event.id}
                      className={cn("hover:bg-muted/50", eventColor)}
                    >
                      <TableCell className="py-2 pl-4 font-mono text-xs text-muted-foreground">
                        {formatTimestamp(event.timestamp)}
                      </TableCell>
                      <TableCell className="py-2">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-sm px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset",
                            badgeColor,
                          )}
                        >
                          {getEventAction(event)}
                        </span>
                      </TableCell>
                      <TableCell className="py-2 text-right text-xs">
                        <div className="flex items-center justify-end gap-1.5">
                          <TokenIcon
                            address={pair.token0}
                            alt={pair.token0Symbol}
                            size={16}
                          />
                          {token0Amount
                            ? formatTokenAmount(token0Amount, token0Dec)
                            : "-"}
                        </div>
                      </TableCell>
                      <TableCell className="py-2 text-right text-xs">
                        <div className="flex items-center justify-end gap-1.5">
                          <TokenIcon
                            address={pair.token1}
                            alt={pair.token1Symbol}
                            size={16}
                          />
                          {token1Amount
                            ? formatTokenAmount(token1Amount, token1Dec)
                            : "-"}
                        </div>
                      </TableCell>
                      <TableCell className="py-2 text-right text-xs">
                        {event.amountUsd ? formatUsd(event.amountUsd) : "-"}
                      </TableCell>
                      <TableCell className="py-2 text-right text-xs">
                        {price > 0 ? formatPriceUsd(price) : "-"}
                      </TableCell>
                      <TableCell className="py-2 text-right">
                        {(() => {
                          const isBuy =
                            event.amount0Out && event.amount0Out !== "0";
                          const userAddress = event.maker
                            ? event.maker
                            : isBuy
                              ? event.recipient || event.toAddress
                              : event.toAddress || event.recipient;

                          return userAddress ? (
                            <Link
                              className="font-mono text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
                              href={`/address/${userAddress}`}
                              title={userAddress}
                            >
                              <AddressDisplay address={userAddress} chars={2} />
                            </Link>
                          ) : (
                            "-"
                          );
                        })()}
                      </TableCell>
                      <TableCell className="py-2 pr-4 text-right">
                        <div className="flex items-center justify-end">
                          <Link
                            href={`/tx/${event.transactionHash}`}
                            className="text-muted-foreground hover:text-foreground"
                            title="View Transaction"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Sidebar (Info & Stats) */}
      <div
        className={cn(
          "w-full shrink-0 overflow-y-auto border-t bg-card md:w-[320px] md:border-l md:border-t-0 lg:w-[360px]",
          activeTab === "info" ? "block" : "hidden md:block",
        )}
      >
        <div className="flex flex-col gap-4 p-4">
          {/* Header Info */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex shrink-0 -space-x-2">
                  <TokenIcon
                    address={pair.token0}
                    alt={pair.token0Symbol}
                    size={32}
                    className="ring-2 ring-card"
                  />
                  <TokenIcon
                    address={pair.token1}
                    alt={pair.token1Symbol}
                    size={32}
                    className="ring-2 ring-card"
                  />
                </div>
                <div>
                  <h1 className="text-lg font-bold leading-none">
                    {pair.token0Symbol}/{pair.token1Symbol}
                  </h1>
                  <p className="text-xs text-muted-foreground mt-1">
                    {pair.token0Name} / {pair.token1Name}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="capitalize">
                {pair.protocol}
              </Badge>
              <Link
                href={`${PLUNDERSWAP_URL}/swap?inputCurrency=${pair.token0}&outputCurrency=${pair.token1}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-5 items-center gap-1.5 rounded-md bg-primary px-2 text-[10px] font-medium text-primary-foreground shadow hover:bg-primary/90"
              >
                Swap <ExternalLink className="h-3 w-3" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link
                href={`/tokens/${pair.token0}`}
                className="inline-flex items-center justify-center gap-1 rounded-md border px-2 py-1.5 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              >
                {pair.token0Symbol}
              </Link>
              <Link
                href={`/tokens/${pair.token1}`}
                className="inline-flex items-center justify-center gap-1 rounded-md border px-2 py-1.5 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              >
                {pair.token1Symbol}
              </Link>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/30 p-2 rounded-md border">
              <span>Pair Address</span>
              <div className="flex items-center gap-2">
                <span className="font-mono">
                  <AddressDisplay address={pair.address} />
                </span>
                <ExplorerDropdown type="address" value={pair.address} />
              </div>
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2">
            <StatBlock
              label="Price (USD)"
              value={pair.priceUsd ? formatPriceUsd(pair.priceUsd) : "-"}
            />
            <StatBlock label="Liquidity" value={formatUsd(pair.liquidityUsd)} />
            <StatBlock
              label="Volume (24h)"
              value={formatUsd(pair.volumeUsd24h)}
            />
            <StatBlock
              label="Transactions"
              value={formatNumber(pair.txnCount, 0)}
            />
            <StatBlock
              label="24h Change"
              value={
                pair.priceChange24h &&
                Number.parseFloat(pair.priceChange24h) !== 0 ? (
                  <span
                    className={
                      Number.parseFloat(pair.priceChange24h) >= 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }
                  >
                    {Number.parseFloat(pair.priceChange24h) >= 0 ? "+" : ""}
                    {formatNumber(pair.priceChange24h, 2)}%
                  </span>
                ) : (
                  "-"
                )
              }
            />
            <StatBlock
              label="7d Change"
              value={
                pair.priceChange7d &&
                Number.parseFloat(pair.priceChange7d) !== 0 ? (
                  <span
                    className={
                      Number.parseFloat(pair.priceChange7d) >= 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }
                  >
                    {Number.parseFloat(pair.priceChange7d) >= 0 ? "+" : ""}
                    {formatNumber(pair.priceChange7d, 2)}%
                  </span>
                ) : (
                  "-"
                )
              }
            />
          </div>

          <div className="h-px bg-border" />

          <SwapWidget
            pair={pair}
            token0Decimals={token0Decimals}
            token1Decimals={token1Decimals}
          />
        </div>
      </div>
    </div>
  );
}

interface StatBlockProps {
  label: string;
  value: string | React.ReactNode;
  className?: string;
  valueClassName?: string;
}

function StatBlock({
  label,
  value,
  className,
  valueClassName,
}: StatBlockProps) {
  return (
    <div className={cn("rounded-md border bg-muted/30 p-2.5", className)}>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-0.5">
        {label}
      </p>
      <p className={cn("text-sm font-semibold", valueClassName)}>{value}</p>
    </div>
  );
}

function getEventAction(event: {
  eventType: string;
  amount0In?: string;
  amount0Out?: string;
  amount1In?: string;
  amount1Out?: string;
}): string {
  const type = event.eventType.toLowerCase();

  if (type === "swap") {
    if (event.amount0Out && event.amount0Out !== "0") {
      return "Buy";
    }
    if (event.amount0In && event.amount0In !== "0") {
      return "Sell";
    }
  }

  return event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1);
}

function getEventColor(event: {
  eventType: string;
  amount0In?: string;
  amount0Out?: string;
}): string {
  const type = event.eventType.toLowerCase();

  if (type === "swap") {
    if (event.amount0Out && event.amount0Out !== "0") {
      return "bg-emerald-500/5 dark:bg-emerald-500/10";
    }
    if (event.amount0In && event.amount0In !== "0") {
      return "bg-rose-500/5 dark:bg-rose-500/10";
    }
  }

  return "";
}

function getBadgeColor(event: {
  eventType: string;
  amount0In?: string;
  amount0Out?: string;
}): string {
  const type = event.eventType.toLowerCase();

  if (type === "swap") {
    if (event.amount0Out && event.amount0Out !== "0") {
      return "text-emerald-700 dark:text-emerald-400 ring-emerald-600/20";
    }
    if (event.amount0In && event.amount0In !== "0") {
      return "text-rose-700 dark:text-rose-400 ring-rose-600/20";
    }
  }

  return "text-muted-foreground ring-border";
}
