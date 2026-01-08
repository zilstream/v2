"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TokenIcon } from "@/components/token-icon";
import { formatTimestamp, formatTokenAmount, formatUsd } from "@/lib/format";
import type { AddressEvent } from "@/lib/api-client";

interface RecentTradesCardProps {
  events: AddressEvent[];
  isLoading?: boolean;
}

export function RecentTradesCard({ events, isLoading }: RecentTradesCardProps) {
  const isEmpty = events.length === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Trades</CardTitle>
        <CardAction>
          <span className="text-sm text-muted-foreground">
            {events.length} trades
          </span>
        </CardAction>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="py-8 text-center text-muted-foreground">
            No recent trades found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Pair</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="text-right">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.slice(0, 10).map((event) => {
                const action = getEventAction(event);
                const badgeColor = getBadgeColor(event);

                return (
                  <TableRow key={`${event.transactionHash}-${event.logIndex}`}>
                    <TableCell>
                      <Badge variant="outline" className={badgeColor}>
                        {action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/pairs/${event.pairAddress}`}
                        className="flex items-center gap-1 hover:underline"
                      >
                        <div className="flex -space-x-1">
                          <TokenIcon
                            address={event.token0Address}
                            alt={event.token0Symbol || ""}
                            size={20}
                          />
                          <TokenIcon
                            address={event.token1Address}
                            alt={event.token1Symbol || ""}
                            size={20}
                          />
                        </div>
                        <span className="text-sm">
                          {event.token0Symbol}/{event.token1Symbol}
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatUsd(event.amountUsd, 2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/tx/${event.transactionHash}`}
                        className="flex items-center justify-end gap-1 text-muted-foreground hover:text-foreground"
                      >
                        <span className="text-xs">
                          {formatRelativeTime(event.timestamp)}
                        </span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function getEventAction(event: AddressEvent): string {
  if (!event.eventType) return "Unknown";

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

function getBadgeColor(event: AddressEvent): string {
  if (!event.eventType) return "";

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

function formatRelativeTime(timestamp: number): string {
  const now = Date.now() / 1000;
  const diff = now - timestamp;

  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;

  return new Date(timestamp * 1000).toLocaleDateString();
}
