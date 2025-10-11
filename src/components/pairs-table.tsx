"use client";

import { useRouter } from "next/navigation";

import { TokenIcon } from "@/components/token-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
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
  onPageChange?: (page: number) => void;
}

export function PairsTable({
  pairs,
  pagination,
  title = "Pairs",
  onPageChange,
}: PairsTableProps) {
  const router = useRouter();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {pairs.map((pair) => (
              <TableRow
                key={pair.address}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => router.push(`/pairs/${pair.address}/events`)}
              >
                <TableCell className="px-6">
                  <div className="flex items-center gap-2">
                    <div className="flex shrink-0 -space-x-1.5">
                      <TokenIcon
                        address={pair.token0}
                        alt={pair.token0Symbol}
                        size={24}
                        className="ring-2 ring-background"
                      />
                      <TokenIcon
                        address={pair.token1}
                        alt={pair.token1Symbol}
                        size={24}
                        className="ring-2 ring-background"
                      />
                    </div>
                    <span className="font-medium">
                      {pair.token0Symbol} / {pair.token1Symbol}
                    </span>
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      {onPageChange && (
        <CardFooter className="flex items-center justify-between border-t px-6 py-4">
          <div className="text-sm text-muted-foreground">
            Page {pagination.page}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={!pagination.hasNext}
            >
              Next
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
