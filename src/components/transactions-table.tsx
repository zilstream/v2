"use client";

import Link from "next/link";
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
import { formatNumber, formatTokenAmount, formatTimestamp } from "@/lib/format";
import type { Pagination, Transaction } from "@/lib/zilstream";

interface TransactionsTableProps {
  transactions: Transaction[];
  pagination: Pagination;
  onPageChange?: (page: number) => void;
}

export function TransactionsTable({
  transactions,
  pagination,
  onPageChange,
}: TransactionsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transactions</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow className="border-border/60">
              <TableHead className="px-6">Transaction Hash</TableHead>
              <TableHead>Block</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead className="text-right">Value (ZIL)</TableHead>
              <TableHead className="text-right">Gas Used</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow key={tx.hash}>
                <TableCell className="px-6">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/tx/${tx.hash}`}
                      className="font-medium text-primary hover:underline font-mono text-sm"
                    >
                      {shortenHash(tx.hash)}
                    </Link>
                    {tx.status !== 0 && (
                      <Badge variant="destructive" className="text-xs">
                        Failed
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Link
                    href={`/block/${tx.blockNumber}`}
                    className="text-primary hover:underline"
                  >
                    {formatNumber(tx.blockNumber, 0)}
                  </Link>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {formatTimestamp(tx.timestamp)}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-sm">
                    {shortenAddress(tx.fromAddress)}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-sm">
                    {tx.toAddress ? (
                      shortenAddress(tx.toAddress)
                    ) : (
                      <span className="text-muted-foreground">
                        Contract Creation
                      </span>
                    )}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  {formatTokenAmount(tx.value, 18, 4)}
                </TableCell>
                <TableCell className="text-right">
                  {formatNumber(tx.gasUsed, 0)}
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

function shortenHash(hash: string) {
  if (!hash) return "";
  return `${hash.slice(0, 10)}…${hash.slice(-8)}`;
}

function shortenAddress(address: string) {
  if (!address) return "";
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
