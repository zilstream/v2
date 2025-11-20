"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { ExplorerDropdown } from "@/components/explorer-dropdown";
import { TokenIcon } from "@/components/token-icon";
import { TradingViewChart } from "@/components/tradingview-chart";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EXPLORER_URL, PLUNDERSWAP_URL } from "@/lib/constants";
import {
  formatNumber,
  formatTimestamp,
  formatTokenAmount,
  formatUsd,
} from "@/lib/format";
import type { Pair, PairEvent, Token, TokenChartData } from "@/lib/zilstream";
import { usePairSubscription } from "@/hooks/use-websocket";

interface PairDetailViewProps {
  initialPair: Pair;
  events: PairEvent[];
  tokens: Token[];
  chartData?: TokenChartData;
}

export function PairDetailView({
  initialPair,
  events,
  tokens,
}: PairDetailViewProps) {
  const [pair, setPair] = useState(initialPair);

  usePairSubscription(pair.address, (updatedPair) => {
    setPair(updatedPair);
  });

  const tokenIndex = new Map(
    tokens.map((token) => [token.address.toLowerCase(), token]),
  );
  const token0Decimals = tokenIndex.get(pair.token0.toLowerCase())?.decimals;
  const token1Decimals = tokenIndex.get(pair.token1.toLowerCase())?.decimals;

  return (
    <div className="flex w-full flex-col gap-4 p-3 md:gap-6 md:p-6">
      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex shrink-0 -space-x-2">
              <TokenIcon
                address={pair.token0}
                alt={pair.token0Symbol}
                size={40}
                className="ring-2 ring-background"
              />
              <TokenIcon
                address={pair.token1}
                alt={pair.token1Symbol}
                size={40}
                className="ring-2 ring-background"
              />
            </div>
            <div>
              <CardTitle>
                {pair.token0Symbol} / {pair.token1Symbol}
              </CardTitle>
              <CardDescription>
                {pair.token0Name} • {pair.token1Name}
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="capitalize">
              {pair.protocol}
            </Badge>
            <Link
              href={`${PLUNDERSWAP_URL}/swap?inputCurrency=${pair.token0}&outputCurrency=${pair.token1}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              Swap
              <ExternalLink className="h-3 w-3" />
            </Link>
            <Link
              href={`/tokens/${pair.token0}`}
              className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1 text-sm font-medium transition hover:bg-muted"
            >
              {pair.token0Symbol}
            </Link>
            <Link
              href={`/tokens/${pair.token1}`}
              className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1 text-sm font-medium transition hover:bg-muted"
            >
              {pair.token1Symbol}
            </Link>
            <ExplorerDropdown type="address" value={pair.address} />
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3 md:grid-cols-5">
          <StatBlock
            label="Liquidity USD"
            value={formatUsd(pair.liquidityUsd)}
          />
          <StatBlock
            label="24h Volume USD"
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
                      ? "text-green-600"
                      : "text-red-600"
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
                      ? "text-green-600"
                      : "text-red-600"
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
        </CardContent>
      </Card>

      <TradingViewChart
        pairAddress={pair.address}
        pairName={`${pair.token0Symbol} / ${pair.token1Symbol}`}
        baseTokenSymbol={pair.token0Symbol}
      />

      <Card>
        <CardHeader>
          <CardTitle>Events</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/60">
                <TableHead className="w-32 px-6">Timestamp</TableHead>
                <TableHead className="w-24">Event</TableHead>
                <TableHead className="w-32 text-right">
                  {pair.token0Symbol}
                </TableHead>
                <TableHead className="w-32 text-right">
                  {pair.token1Symbol}
                </TableHead>
                <TableHead className="w-32 text-right">Amount (USD)</TableHead>
                <TableHead className="w-28 text-right">Maker</TableHead>
                <TableHead className="w-12 text-right">Tx</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => {
                const eventColor = getEventColor(event);
                const badgeColor = getBadgeColor(event);

                const token0Amount =
                  event.amount0In && event.amount0In !== "0"
                    ? event.amount0In
                    : event.amount0Out && event.amount0Out !== "0"
                      ? event.amount0Out
                      : undefined;

                const token1Amount =
                  event.amount1In && event.amount1In !== "0"
                    ? event.amount1In
                    : event.amount1Out && event.amount1Out !== "0"
                      ? event.amount1Out
                      : undefined;

                return (
                  <TableRow key={event.id} className={eventColor}>
                    <TableCell className="px-6 text-muted-foreground">
                      {formatTimestamp(event.timestamp)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={badgeColor}>
                        {getEventAction(event)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <TokenIcon
                          address={pair.token0}
                          alt={pair.token0Symbol}
                          size={20}
                        />
                        {token0Amount
                          ? formatTokenAmount(token0Amount, token0Decimals)
                          : "-"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <TokenIcon
                          address={pair.token1}
                          alt={pair.token1Symbol}
                          size={20}
                        />
                        {token1Amount
                          ? formatTokenAmount(token1Amount, token1Decimals)
                          : "-"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatUsd(event.amountUsd, 4)}
                    </TableCell>
                    <TableCell className="truncate text-right">
                      {(() => {
                        const isBuy =
                          event.amount0Out && event.amount0Out !== "0";
                        const userAddress = isBuy
                          ? event.recipient || event.toAddress
                          : event.toAddress || event.recipient;

                        return userAddress ? (
                          <Link
                            className="underline underline-offset-4"
                            href={`/address/${userAddress}`}
                          >
                            {userAddress.slice(0, 6)}…{userAddress.slice(-4)}
                          </Link>
                        ) : (
                          "-"
                        );
                      })()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        className="inline-flex items-center justify-end text-muted-foreground"
                        href={`/tx/${event.transactionHash}`}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

interface StatBlockProps {
  label: string;
  value: string | React.ReactNode;
}

function StatBlock({ label, value }: StatBlockProps) {
  return (
    <div className="rounded-lg border border-border/60 bg-secondary/20 p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
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
      return "text-emerald-600/80 dark:text-emerald-400/90";
    }
    if (event.amount0In && event.amount0In !== "0") {
      return "text-rose-600/80 dark:text-rose-400/90";
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
      return "border-emerald-600/50 bg-emerald-600/10 text-emerald-600 dark:border-emerald-400/50 dark:bg-emerald-400/10 dark:text-emerald-400";
    }
    if (event.amount0In && event.amount0In !== "0") {
      return "border-rose-600/50 bg-rose-600/10 text-rose-600 dark:border-rose-400/50 dark:bg-rose-400/10 dark:text-rose-400";
    }
  }

  return "";
}
