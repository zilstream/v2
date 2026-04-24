import { Link } from "@tanstack/react-router";

import { SortableHeader } from "@/components/sortable-header";
import { TableSearch } from "@/components/table-search";
import { TokenIcon } from "@/components/token-icon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WatchlistButton } from "@/components/watchlist-button";
import type { SortOrder } from "@/hooks/use-table-params";
import {
  formatNumber,
  formatPriceUsd,
  formatUsd,
  formatZilPrice,
} from "@/lib/format";
import type { Token } from "@/lib/zilstream";

interface TokensTableProps {
  tokens: Token[];
  title?: string;
  search?: string;
  onSearchChange?: (value: string) => void;
  sortBy?: string;
  sortOrder?: SortOrder;
  onSortChange?: (column: string) => void;
  emptyMessage?: string;
}

export function TokensTable({
  tokens,
  title = "Tokens",
  search,
  onSearchChange,
  sortBy,
  sortOrder,
  onSortChange,
  emptyMessage = "No tokens found.",
}: TokensTableProps) {
  const sortProps =
    sortBy && sortOrder && onSortChange
      ? { currentSort: sortBy, currentOrder: sortOrder, onSort: onSortChange }
      : null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
        <CardTitle>{title}</CardTitle>
        {onSearchChange && (
          <TableSearch
            value={search ?? ""}
            onChange={onSearchChange}
            placeholder="Search tokens..."
          />
        )}
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow className="border-border/60">
              <TableHead className="w-12 pl-6 pr-0" />
              <TableHead>Token</TableHead>
              {sortProps ? (
                <SortableHeader column="price" label="Price" {...sortProps} />
              ) : (
                <TableHead className="text-right">Price</TableHead>
              )}
              <TableHead className="text-right">Price (ZIL)</TableHead>
              {sortProps ? (
                <SortableHeader
                  column="price_change_24h"
                  label="24h %"
                  {...sortProps}
                />
              ) : (
                <TableHead className="text-right">24h %</TableHead>
              )}
              {sortProps ? (
                <SortableHeader
                  column="price_change_7d"
                  label="7d %"
                  {...sortProps}
                />
              ) : (
                <TableHead className="text-right">7d %</TableHead>
              )}
              {sortProps ? (
                <SortableHeader
                  column="market_cap"
                  label="Market Cap"
                  {...sortProps}
                />
              ) : (
                <TableHead className="text-right">Market Cap</TableHead>
              )}
              {sortProps ? (
                <SortableHeader
                  column="volume_24h"
                  label="Volume (24h)"
                  {...sortProps}
                />
              ) : (
                <TableHead className="text-right">Volume (24h)</TableHead>
              )}
              {sortProps ? (
                <SortableHeader
                  column="liquidity"
                  label="Liquidity"
                  {...sortProps}
                />
              ) : (
                <TableHead className="text-right">Liquidity</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {tokens.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              tokens.map((token) => (
                <TableRow key={token.address}>
                  <TableCell className="pl-6 pr-0">
                    <WatchlistButton kind="token" address={token.address} />
                  </TableCell>
                  <TableCell>
                    <Link
                      to="/tokens/$address"
                      params={{ address: token.address }}
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
