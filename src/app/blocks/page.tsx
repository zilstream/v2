import Link from "next/link";
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
import { formatNumber, formatTimestamp } from "@/lib/format";
import { fetchBlocks } from "@/lib/zilstream";

export default async function BlocksPage() {
  const { data: blocks, pagination } = await fetchBlocks();

  return (
    <div className="flex w-full flex-col gap-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Blocks</h1>
        <p className="text-muted-foreground">
          Recent blocks on the Zilliqa network.
        </p>
      </div>

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
                    <span className="text-sm">{formatTimestamp(block.timestamp)}</span>
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
                    {formatNumber(Number.parseFloat(block.baseFeePerGas) / 1e9, 2)} Gwei
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function shortenHash(hash: string) {
  if (!hash) return "";
  return `${hash.slice(0, 10)}…${hash.slice(-8)}`;
}
