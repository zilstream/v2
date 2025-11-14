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
import { formatNumber, formatTokenAmount, formatTimestamp } from "@/lib/format";
import { AddressInfo } from "@/components/address-info";
import { AddressEvents } from "@/components/address-events";
import { CopyButton } from "@/components/copy-button";
import { ExplorerDropdown } from "@/components/explorer-dropdown";

export default async function AddressPage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = await params;

  const [txResponse, eventsResponse] = await Promise.all([
    fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/addresses/${address}/transactions?page=1&per_page=25`,
      { next: { revalidate: 60 } },
    ),
    fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/addresses/${address}/events?page=1&per_page=10`,
      { next: { revalidate: 60 } },
    ),
  ]);

  const result = await txResponse.json();
  const transactions = result?.data || [];

  const eventsResult = await eventsResponse.json();
  const events = eventsResult?.data || [];
  const hasMoreEvents = eventsResult?.pagination?.has_more || false;

  return (
    <div className="flex w-full flex-col gap-4 p-3 md:gap-6 md:p-6">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">Address</h1>
            <div className="flex items-center gap-2">
              <p className="font-mono text-sm text-muted-foreground break-all">
                {address}
              </p>
              <CopyButton text={address} />
            </div>
          </div>
          <ExplorerDropdown type="address" value={address} />
        </div>
        <AddressInfo address={address} />
      </div>

      <AddressEvents
        initialEvents={events}
        initialHasMore={hasMoreEvents}
        address={address}
      />

      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>All transactions for this address</CardDescription>
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
              {transactions.map((tx: any) => (
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
                      href={`/block/${tx.block_number}`}
                      className="text-primary hover:underline"
                    >
                      {formatNumber(tx.block_number, 0)}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {formatTimestamp(tx.timestamp)}
                    </span>
                  </TableCell>
                  <TableCell>
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
                  <TableCell>
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
                  <TableCell className="text-right">
                    {formatTokenAmount(tx.value, 18, 4)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(tx.gas_used, 0)}
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
