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

export default async function AddressPage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = await params;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/addresses/${address}/transactions?page=1&per_page=25`,
    { next: { revalidate: 60 } }
  );

  const result = await response.json();
  const transactions = result?.data || [];
  const pagination = result?.pagination;

  return (
    <div className="flex w-full flex-col gap-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Address</h1>
        <p className="font-mono text-sm text-muted-foreground">{address}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>
            All transactions for this address
          </CardDescription>
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
              {transactions.map((tx: any) => (
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
                      href={`/block/${tx.block_number}`}
                      className="text-primary hover:underline"
                    >
                      {formatNumber(tx.block_number, 0)}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/address/${tx.from_address}`}
                      className="font-mono text-sm text-primary hover:underline"
                    >
                      {shortenAddress(tx.from_address)}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {tx.to_address ? (
                      <Link
                        href={`/address/${tx.to_address}`}
                        className="font-mono text-sm text-primary hover:underline"
                      >
                        {shortenAddress(tx.to_address)}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">Contract Creation</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatTokenAmount(tx.value, 18, 4)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(tx.gas_used, 0)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={tx.status === 1 ? "default" : "destructive"}>
                      {tx.status === 1 ? "Success" : "Failed"}
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
