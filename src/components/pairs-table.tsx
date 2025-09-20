import Link from "next/link";

import { TokenIcon } from "@/components/token-icon";
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
import { formatNumber, formatUsd } from "@/lib/format";
import type { Pagination, Pair } from "@/lib/zilstream";

interface PairsTableProps {
  pairs: Pair[];
  pagination: Pagination;
  title?: string;
  description?: string;
}

export function PairsTable({
  pairs,
  pagination,
  title = "Pairs",
  description = `Page ${pagination.page} • Showing up to ${pagination.perPage} pairs`,
}: PairsTableProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Badge variant={pagination.hasNext ? "secondary" : "outline"}>
          {pagination.hasNext ? "More available" : "End of list"}
        </Badge>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow className="border-border/60">
              <TableHead className="px-6">Pair</TableHead>
              <TableHead>Protocol</TableHead>
              <TableHead className="text-right">Liquidity (USD)</TableHead>
              <TableHead className="text-right">Volume (24h USD)</TableHead>
              <TableHead className="text-right">Transactions</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pairs.map((pair) => (
              <TableRow key={pair.address}>
                <TableCell className="px-6">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      <TokenIcon
                        address={pair.token0}
                        alt={pair.token0Symbol}
                        size={32}
                        className="ring-2 ring-background"
                      />
                      <TokenIcon
                        address={pair.token1}
                        alt={pair.token1Symbol}
                        size={32}
                        className="ring-2 ring-background"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {pair.token0Symbol} / {pair.token1Symbol}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {shortenAddress(pair.address)}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {pair.protocol}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {formatUsd(pair.liquidityUsd)}
                </TableCell>
                <TableCell className="text-right">
                  {formatUsd(pair.volumeUsd)}
                </TableCell>
                <TableCell className="text-right">
                  {formatNumber(pair.txnCount, 0)}
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    className="text-primary underline underline-offset-4"
                    href={`/pairs/${pair.address}/events`}
                  >
                    View events
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function shortenAddress(address: string) {
  if (!address) return "";
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
