"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { formatNumber, formatTokenAmount, formatTimestamp } from "@/lib/format";

interface Transaction {
  hash: string;
  block_number: number;
  timestamp: number;
  from_address: string;
  to_address: string | null;
  value: string;
  gas_used: number;
  status: number;
}

interface AddressTransactionsProps {
  initialTransactions: Transaction[];
  initialHasMore: boolean;
  address: string;
}

export function AddressTransactions({
  initialTransactions,
  initialHasMore,
  address,
}: AddressTransactionsProps) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);

  async function loadPage(newPage: number) {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/addresses/${address}/transactions?page=${newPage}&per_page=25`,
      );
      const result = await response.json();
      const newTransactions = result.data || [];
      setTransactions(newTransactions);
      setHasMore(
        result.pagination?.has_next || 
        newTransactions.length === 25
      );
      setPage(newPage);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transactions</CardTitle>
        <CardDescription>All transactions for this address</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow className="border-border/60">
              <TableHead className="px-6 py-2">Transaction Hash</TableHead>
              <TableHead className="py-2">Block</TableHead>
              <TableHead className="py-2">Timestamp</TableHead>
              <TableHead className="py-2">From</TableHead>
              <TableHead className="py-2">To</TableHead>
              <TableHead className="text-right py-2">Value (ZIL)</TableHead>
              <TableHead className="text-right py-2">Gas Used</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow key={tx.hash}>
                <TableCell className="px-6 py-2">
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
                <TableCell className="py-2">
                  <Link
                    href={`/block/${tx.block_number}`}
                    className="text-primary hover:underline"
                  >
                    {formatNumber(tx.block_number, 0)}
                  </Link>
                </TableCell>
                <TableCell className="py-2">
                  <span className="text-sm">
                    {formatTimestamp(tx.timestamp)}
                  </span>
                </TableCell>
                <TableCell className="py-2">
                  {tx.from_address.toLowerCase() === address.toLowerCase() ? (
                    <Badge variant="secondary">You</Badge>
                  ) : (
                    <Link
                      href={`/address/${tx.from_address}`}
                      className="font-mono text-sm text-primary hover:underline"
                    >
                      {shortenAddress(tx.from_address)}
                    </Link>
                  )}
                </TableCell>
                <TableCell className="py-2">
                  {tx.to_address ? (
                    tx.to_address.toLowerCase() === address.toLowerCase() ? (
                      <Badge variant="secondary">You</Badge>
                    ) : (
                      <Link
                        href={`/address/${tx.to_address}`}
                        className="font-mono text-sm text-primary hover:underline"
                      >
                        {shortenAddress(tx.to_address)}
                      </Link>
                    )
                  ) : (
                    <span className="text-muted-foreground">
                      Contract Creation
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right py-2">
                  {formatTokenAmount(tx.value, 18, 4)}
                </TableCell>
                <TableCell className="text-right py-2">
                  {formatNumber(tx.gas_used, 0)}
                </TableCell>
              </TableRow>
            ))}
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

function shortenHash(hash: string) {
  if (!hash) return "";
  return `${hash.slice(0, 10)}…${hash.slice(-8)}`;
}

function shortenAddress(address: string) {
  if (!address) return "";
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
