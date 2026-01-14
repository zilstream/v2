"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AddressDisplay } from "@/components/address-display";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAddressTransactions } from "@/hooks/use-zilstream-queries";
import { formatNumber, formatTimestamp, formatTokenAmount } from "@/lib/format";

interface AddressTransactionsProps {
  address: string;
}

export function AddressTransactions({ address }: AddressTransactionsProps) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAddressTransactions(address, page, 25);
  const transactions = data?.data ?? [];
  const hasMore = data?.pagination?.hasNext ?? false;

  if (isLoading && transactions.length === 0) {
    return <AddressTransactionsSkeleton />;
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
                    href={`/block/${tx.blockNumber}`}
                    className="text-primary hover:underline"
                  >
                    {formatNumber(tx.blockNumber, 0)}
                  </Link>
                </TableCell>
                <TableCell className="py-2">
                  <span className="text-sm">
                    {formatTimestamp(tx.timestamp)}
                  </span>
                </TableCell>
                <TableCell className="py-2">
                  {tx.fromAddress.toLowerCase() === address.toLowerCase() ? (
                    <Badge variant="secondary">You</Badge>
                  ) : (
                    <Link
                      href={`/address/${tx.fromAddress}`}
                      className="font-mono text-sm text-primary hover:underline"
                    >
                      <AddressDisplay address={tx.fromAddress} />
                    </Link>
                  )}
                </TableCell>
                <TableCell className="py-2">
                  {tx.toAddress ? (
                    tx.toAddress.toLowerCase() === address.toLowerCase() ? (
                      <Badge variant="secondary">You</Badge>
                    ) : (
                      <Link
                        href={`/address/${tx.toAddress}`}
                        className="font-mono text-sm text-primary hover:underline"
                      >
                        <AddressDisplay address={tx.toAddress} />
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
                  {formatNumber(tx.gasUsed, 0)}
                </TableCell>
              </TableRow>
            ))}
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

function AddressTransactionsSkeleton() {
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
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell className="px-6 py-2">
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell className="py-2">
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell className="py-2">
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell className="py-2">
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell className="py-2">
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell className="text-right py-2">
                  <Skeleton className="ml-auto h-4 w-16" />
                </TableCell>
                <TableCell className="text-right py-2">
                  <Skeleton className="ml-auto h-4 w-12" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function shortenHash(hash: string) {
  if (!hash) return "";
  return `${hash.slice(0, 10)}…${hash.slice(-8)}`;
}
