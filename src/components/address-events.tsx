"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TokenIcon } from "@/components/token-icon";
import {
  formatTimestamp,
  formatTokenAmount,
  formatUsd,
} from "@/lib/format";

interface AddressEvent {
  eventType: string;
  id: string;
  transactionHash: string;
  timestamp: number;
  address: string;
  blockNumber: number;
  protocol: string;
  amount0In?: string;
  amount1In?: string;
  amount0Out?: string;
  amount1Out?: string;
  amountUsd: string;
  token0?: string;
  token1?: string;
  token0Symbol?: string;
  token1Symbol?: string;
  token0Decimals?: number;
  token1Decimals?: number;
}

interface AddressEventsProps {
  initialEvents: AddressEvent[];
  initialHasMore: boolean;
  address: string;
}

export function AddressEvents({
  initialEvents,
  initialHasMore,
  address,
}: AddressEventsProps) {
  const [events, setEvents] = useState(initialEvents);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);

  async function loadPage(newPage: number) {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/addresses/${address}/events?page=${newPage}&per_page=10`,
      );
      const result = await response.json();
      setEvents(result.data || []);
      setHasMore(result.pagination?.has_more || false);
      setPage(newPage);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  }

  if (events.length === 0) {
    return null;
  }

  return (
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
              <TableHead className="w-32 text-right">Token 0</TableHead>
              <TableHead className="w-32 text-right">Token 1</TableHead>
              <TableHead className="w-32 text-right">Amount (USD)</TableHead>
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
                      {event.token0 && (
                        <TokenIcon
                          address={event.token0}
                          alt={event.token0Symbol || ""}
                          size={20}
                        />
                      )}
                      {token0Amount
                        ? formatTokenAmount(token0Amount, event.token0Decimals)
                        : "-"}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {event.token1 && (
                        <TokenIcon
                          address={event.token1}
                          alt={event.token1Symbol || ""}
                          size={20}
                        />
                      )}
                      {token1Amount
                        ? formatTokenAmount(token1Amount, event.token1Decimals)
                        : "-"}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatUsd(event.amountUsd, 4)}
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
        <div className="flex items-center justify-end gap-2 px-6 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadPage(page - 1)}
            disabled={page === 1 || loading}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">Page {page}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadPage(page + 1)}
            disabled={!hasMore || loading}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
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

function getEventColor(event: AddressEvent): string {
  if (!event.eventType) return "";

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
