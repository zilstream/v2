"use client";

import Link from "next/link";
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
import { formatNumber, formatTimestamp } from "@/lib/format";
import type { Pagination, Block } from "@/lib/zilstream";

interface BlocksTableProps {
  blocks: Block[];
  pagination: Pagination;
  onPageChange?: (page: number) => void;
}

export function BlocksTable({
  blocks,
  pagination,
  onPageChange,
}: BlocksTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Blocks</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow className="border-border/60">
              <TableHead className="px-6">Block</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead className="text-right">Transactions</TableHead>
              <TableHead className="text-right">Gas Used</TableHead>
              <TableHead className="text-right">Gas Limit</TableHead>
              <TableHead className="text-right">Base Fee</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blocks.map((block) => (
              <TableRow key={block.number}>
                <TableCell className="px-6">
                  <div className="flex flex-col">
                    <Link
                      href={`/block/${block.number}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {formatNumber(block.number, 0)}
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      {shortenHash(block.hash)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {formatTimestamp(block.timestamp)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  {formatNumber(block.transactionCount, 0)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-col items-end">
                    <span>{formatNumber(block.gasUsed, 0)}</span>
                    <span className="text-xs text-muted-foreground">
                      {((block.gasUsed / block.gasLimit) * 100).toFixed(1)}%
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {formatNumber(block.gasLimit, 0)}
                </TableCell>
                <TableCell className="text-right">
                  {formatNumber(
                    Number.parseFloat(block.baseFeePerGas) / 1e9,
                    2,
                  )}{" "}
                  Gwei
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
