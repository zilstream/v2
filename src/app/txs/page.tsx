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
import { formatNumber, formatTokenAmount } from "@/lib/format";
import { fetchTransactions } from "@/lib/zilstream";

export default async function TransactionsPage() {
  const { data: transactions, pagination } = await fetchTransactions();

  return (
    <div className="flex w-full flex-col gap-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Transactions</h1>
        <p className="text-muted-foreground">
          Recent transactions on the Zilliqa network.
        </p>
      </div>

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
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead className="text-right">Value (ZIL)</TableHead>
                <TableHead className="text-right">Gas Used</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.hash}>
                  <TableCell className="px-6">
                    <Link
                      href={`/tx/${tx.hash}`}
                      className="font-medium text-primary hover:underline font-mono text-sm"
                    >
                      {shortenHash(tx.hash)}
                    </Link>
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
                    <span className="font-mono text-sm">
                      {shortenAddress(tx.fromAddress)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">
                      {tx.toAddress ? shortenAddress(tx.toAddress) : (
                        <span className="text-muted-foreground">Contract Creation</span>
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatTokenAmount(tx.value, 18, 4)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(tx.gasUsed, 0)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={tx.status === 0 ? "default" : "destructive"}>
                      {tx.status === 0 ? "Success" : "Failed"}
                    </Badge>
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

function shortenAddress(address: string) {
  if (!address) return "";
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
