import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AddressDisplay } from "@/components/address-display";
import { ExplorerDropdown } from "@/components/explorer-dropdown";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber, formatTimestamp } from "@/lib/format";
import { fetchBlockByNumber } from "@/lib/zilstream";

export const Route = createFileRoute("/block/$number")({
  loader: async ({ params }) => {
    const blockNumber = Number.parseInt(params.number, 10);
    if (!Number.isFinite(blockNumber) || blockNumber < 0) throw notFound();
    try {
      const block = await fetchBlockByNumber(blockNumber);
      return { block };
    } catch {
      throw notFound();
    }
  },
  pendingComponent: BlockLoading,
  component: BlockDetailPage,
});

function BlockDetailPage() {
  const { block } = Route.useLoaderData();

  return (
    <div className="flex w-full flex-col gap-4 p-3 md:gap-6 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">
            Block #{formatNumber(block.number, 0)}
          </h1>
          <p className="text-muted-foreground">
            Block details for block {formatNumber(block.number, 0)}
          </p>
        </div>
        <ExplorerDropdown type="block" value={block.number} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
          <CardDescription>Basic block information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <DetailRow
            label="Block Number"
            value={formatNumber(block.number, 0)}
          />
          <DetailRow label="Block Hash" value={block.hash} copyable />
          <DetailRow label="Parent Hash" value={block.parentHash} copyable />
          <DetailRow
            label="Timestamp"
            value={formatTimestamp(block.timestamp)}
          />
          <DetailRow
            label="Transactions"
            value={formatNumber(block.transactionCount, 0)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gas Information</CardTitle>
          <CardDescription>Gas usage and limits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <DetailRow
            label="Gas Used"
            value={`${formatNumber(block.gasUsed, 0)} (${((block.gasUsed / block.gasLimit) * 100).toFixed(2)}%)`}
          />
          <DetailRow
            label="Gas Limit"
            value={formatNumber(block.gasLimit, 0)}
          />
          <DetailRow
            label="Base Fee"
            value={`${formatNumber(Number.parseFloat(block.baseFeePerGas) / 1e9, 2)} Gwei`}
          />
        </CardContent>
      </Card>

      {block.transactions && block.transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>
              {block.transactions.length} transaction
              {block.transactions.length !== 1 ? "s" : ""} in this block
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60">
                    <th className="pb-3 text-left font-medium text-muted-foreground">
                      Hash
                    </th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">
                      From
                    </th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">
                      To
                    </th>
                    <th className="pb-3 text-right font-medium text-muted-foreground">
                      Value
                    </th>
                    <th className="pb-3 text-right font-medium text-muted-foreground">
                      Gas Used
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {block.transactions.map((tx) => (
                    <tr key={tx.hash} className="border-b border-border/40">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            to="/tx/$hash"
                            params={{ hash: tx.hash }}
                            className="font-mono text-primary hover:underline"
                          >
                            {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
                          </Link>
                          {tx.status !== 0 && (
                            <span className="inline-block rounded bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-500">
                              Failed
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3">
                        <Link
                          to="/address/$address"
                          params={{ address: tx.fromAddress }}
                          className="font-mono text-primary hover:underline"
                        >
                          <AddressDisplay address={tx.fromAddress} />
                        </Link>
                      </td>
                      <td className="py-3">
                        {tx.toAddress ? (
                          <Link
                            to="/address/$address"
                            params={{ address: tx.toAddress }}
                            className="font-mono text-primary hover:underline"
                          >
                            <AddressDisplay address={tx.toAddress} />
                          </Link>
                        ) : (
                          <span className="font-mono text-muted-foreground">
                            Contract Creation
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-right font-mono">
                        {(Number.parseFloat(tx.value) / 1e18).toFixed(4)} ZIL
                      </td>
                      <td className="py-3 text-right font-mono">
                        {formatNumber(tx.gasUsed, 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Link to="/blocks" className="text-sm text-primary hover:underline">
        ← Back to blocks
      </Link>
    </div>
  );
}

function DetailRow({
  label,
  value,
  copyable: _copyable = false,
}: {
  label: string;
  value: string;
  copyable?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-border/60 pb-4 last:border-0 last:pb-0 sm:flex-row sm:gap-4">
      <dt className="min-w-48 text-sm font-medium text-muted-foreground">
        {label}
      </dt>
      <dd className="flex-1 break-all text-sm font-mono">{value}</dd>
    </div>
  );
}

function BlockLoading() {
  return (
    <div className="flex w-full flex-col gap-4 p-3 md:gap-6 md:p-6">
      <div className="space-y-1">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
          <CardDescription>Basic block information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton rows
              key={i}
              className="flex flex-col gap-1 border-b border-border/60 pb-4 last:border-0 last:pb-0"
            >
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gas Information</CardTitle>
          <CardDescription>Gas usage and limits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton rows
              key={i}
              className="flex flex-col gap-1 border-b border-border/60 pb-4 last:border-0 last:pb-0"
            >
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-40" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
