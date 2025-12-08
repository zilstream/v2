"use client";

import Link from "next/link";

import { TokenIcon } from "@/components/token-icon";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
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
import { formatNumber, formatPriceUsd, formatUsd, formatZilPrice } from "@/lib/format";
import { useTokens } from "@/hooks/use-zilstream-queries";

export function TokensTableClient() {
  const { data, isLoading } = useTokens(1, 100);
  const tokens = data?.data ?? [];

  if (isLoading && tokens.length === 0) {
    return <TokensTableSkeleton />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tokens</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow className="border-border/60">
              <TableHead className="px-6">Token</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Price (ZIL)</TableHead>
              <TableHead className="text-right">24h %</TableHead>
              <TableHead className="text-right">7d %</TableHead>
              <TableHead className="text-right">Market Cap</TableHead>
              <TableHead className="text-right">Volume (24h)</TableHead>
              <TableHead className="text-right">Liquidity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tokens.map((token) => (
              <TableRow key={token.address}>
                <TableCell className="px-6">
                  <Link
                    href={`/tokens/${token.address}`}
                    className="flex items-center gap-3 transition hover:opacity-80"
                  >
                    <TokenIcon
                      address={token.address}
                      alt={token.symbol ?? token.name ?? "Token"}
                      size={36}
                    />
                    <div className="font-medium">
                      {token.name ?? "-"}{" "}
                      {token.symbol && (
                        <span className="text-muted-foreground">
                          {token.symbol}
                        </span>
                      )}
                    </div>
                  </Link>
                </TableCell>
                <TableCell className="text-right">
                  {token.priceUsd ? formatPriceUsd(token.priceUsd) : "-"}
                </TableCell>
                <TableCell className="text-right">
                  {token.priceEth ? formatZilPrice(token.priceEth) : "-"}
                </TableCell>
                <TableCell className="text-right">
                  {token.priceChange24h &&
                  Number.parseFloat(token.priceChange24h) !== 0 ? (
                    <span
                      className={
                        Number.parseFloat(token.priceChange24h) >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {Number.parseFloat(token.priceChange24h) >= 0
                        ? "+"
                        : ""}
                      {formatNumber(token.priceChange24h, 2)}%
                    </span>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {token.priceChange7d &&
                  Number.parseFloat(token.priceChange7d) !== 0 ? (
                    <span
                      className={
                        Number.parseFloat(token.priceChange7d) >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {Number.parseFloat(token.priceChange7d) >= 0 ? "+" : ""}
                      {formatNumber(token.priceChange7d, 2)}%
                    </span>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {token.marketCapUsd ? formatUsd(token.marketCapUsd) : "-"}
                </TableCell>
                <TableCell className="text-right">
                  {token.volume24hUsd ? formatUsd(token.volume24hUsd) : "-"}
                </TableCell>
                <TableCell className="text-right">
                  {token.liquidityUsd ? formatUsd(token.liquidityUsd) : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function TokensTableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tokens</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow className="border-border/60">
              <TableHead className="px-6">Token</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Price (ZIL)</TableHead>
              <TableHead className="text-right">24h %</TableHead>
              <TableHead className="text-right">7d %</TableHead>
              <TableHead className="text-right">Market Cap</TableHead>
              <TableHead className="text-right">Volume (24h)</TableHead>
              <TableHead className="text-right">Liquidity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 10 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell className="px-6">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="ml-auto h-4 w-16" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="ml-auto h-4 w-16" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="ml-auto h-4 w-12" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="ml-auto h-4 w-12" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="ml-auto h-4 w-20" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="ml-auto h-4 w-16" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="ml-auto h-4 w-16" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
