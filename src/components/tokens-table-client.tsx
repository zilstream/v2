"use client";

import Link from "next/link";

import { SortableHeader } from "@/components/sortable-header";
import { TableSearch } from "@/components/table-search";
import { TokenIcon } from "@/components/token-icon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTableParams } from "@/hooks/use-table-params";
import { useTokens } from "@/hooks/use-zilstream-queries";
import {
  formatNumber,
  formatPriceUsd,
  formatUsd,
  formatZilPrice,
} from "@/lib/format";

const TOKEN_SORT_DEFAULT = { sortBy: "liquidity", sortOrder: "desc" } as const;

export function TokensTableClient() {
  const { search, sortBy, sortOrder, setSearch, toggleSort } =
    useTableParams(TOKEN_SORT_DEFAULT);
  const { data, isLoading } = useTokens(1, 100, {
    search: search || undefined,
    sortBy,
    sortOrder,
  });
  const tokens = data?.data ?? [];

  if (isLoading && tokens.length === 0 && !search) {
    return <TokensTableSkeleton />;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
        <CardTitle>Tokens</CardTitle>
        <TableSearch
          value={search}
          onChange={setSearch}
          placeholder="Search tokens..."
        />
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow className="border-border/60">
              <TableHead className="px-6">Token</TableHead>
              <SortableHeader
                column="price"
                label="Price"
                currentSort={sortBy}
                currentOrder={sortOrder}
                onSort={toggleSort}
              />
              <TableHead className="text-right">Price (ZIL)</TableHead>
              <SortableHeader
                column="price_change_24h"
                label="24h %"
                currentSort={sortBy}
                currentOrder={sortOrder}
                onSort={toggleSort}
              />
              <SortableHeader
                column="price_change_7d"
                label="7d %"
                currentSort={sortBy}
                currentOrder={sortOrder}
                onSort={toggleSort}
              />
              <SortableHeader
                column="market_cap"
                label="Market Cap"
                currentSort={sortBy}
                currentOrder={sortOrder}
                onSort={toggleSort}
              />
              <SortableHeader
                column="volume_24h"
                label="Volume (24h)"
                currentSort={sortBy}
                currentOrder={sortOrder}
                onSort={toggleSort}
              />
              <SortableHeader
                column="liquidity"
                label="Liquidity"
                currentSort={sortBy}
                currentOrder={sortOrder}
                onSort={toggleSort}
              />
            </TableRow>
          </TableHeader>
          <TableBody>
            {tokens.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-24 text-center text-muted-foreground"
                >
                  No tokens found.
                </TableCell>
              </TableRow>
            ) : (
              tokens.map((token) => (
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
              ))
            )}
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
