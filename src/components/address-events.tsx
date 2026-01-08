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
import { formatTimestamp, formatTokenAmount, formatUsd } from "@/lib/format";
import { useAddressEvents } from "@/hooks/use-zilstream-queries";
import type { AddressEvent } from "@/lib/api-client";

interface AddressEventsProps {
  address: string;
}

export function AddressEvents({ address }: AddressEventsProps) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAddressEvents(address, page, 10);
  const events = data?.data ?? [];
  const hasMore = data?.pagination?.hasNext ?? false;

  if (isLoading && events.length === 0) {
    return null;
  }

  if (events.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Events</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow className="border-border/60">
              <TableHead className="w-32 px-6 py-2">Timestamp</TableHead>
              <TableHead className="w-24 py-2">Event</TableHead>
              <TableHead className="w-32 text-right py-2">Token 0</TableHead>
              <TableHead className="w-32 text-right py-2">Token 1</TableHead>
              <TableHead className="w-32 text-right py-2">
                Amount (USD)
              </TableHead>
              <TableHead className="w-12 text-right py-2">Tx</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => {
              const eventColor = getEventColor(event);
              const badgeColor = getBadgeColor(event);

              const token0IsIn = event.amount0In && event.amount0In !== "0";
              const token1IsIn = event.amount1In && event.amount1In !== "0";

              const token0Amount = token0IsIn
                ? event.amount0In
                : event.amount0Out && event.amount0Out !== "0"
                  ? event.amount0Out
                  : undefined;

              const token1Amount = token1IsIn
                ? event.amount1In
                : event.amount1Out && event.amount1Out !== "0"
                  ? event.amount1Out
                  : undefined;

              // Use decimals from event when available
              const token0Dec = token0IsIn
                ? (event.tokenInDecimals ?? 18)
                : (event.tokenOutDecimals ?? 18);
              const token1Dec = token1IsIn
                ? (event.tokenInDecimals ?? 18)
                : (event.tokenOutDecimals ?? 18);

              return (
                <TableRow
                  key={`${event.transactionHash}-${event.logIndex}`}
                  className={eventColor}
                >
                  <TableCell className="px-6 py-2 text-muted-foreground">
                    {formatTimestamp(event.timestamp)}
                  </TableCell>
                  <TableCell className="py-2">
                    <Badge variant="outline" className={badgeColor}>
                      {getEventAction(event)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right py-2">
                    <div className="flex items-center justify-end gap-2">
                      {event.token0Address && (
                        <TokenIcon
                          address={event.token0Address}
                          alt={event.token0Symbol || ""}
                          size={20}
                        />
                      )}
                      {token0Amount ? formatTokenAmount(token0Amount, token0Dec) : "-"}
                    </div>
                  </TableCell>
                  <TableCell className="text-right py-2">
                    <div className="flex items-center justify-end gap-2">
                      {event.token1Address && (
                        <TokenIcon
                          address={event.token1Address}
                          alt={event.token1Symbol || ""}
                          size={20}
                        />
                      )}
                      {token1Amount ? formatTokenAmount(token1Amount, token1Dec) : "-"}
                    </div>
                  </TableCell>
                  <TableCell className="text-right py-2">
                    {formatUsd(event.amountUsd, 4)}
                  </TableCell>
                  <TableCell className="text-right py-2">
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
            onClick={() => setPage(page - 1)}
            disabled={page === 1 || isLoading}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">Page {page}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={!hasMore || isLoading}
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
