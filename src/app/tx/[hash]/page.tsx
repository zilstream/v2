import Link from "next/link";
import { notFound } from "next/navigation";
import { ExplorerDropdown } from "@/components/explorer-dropdown";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatNumber, formatTokenAmount, formatTimestamp } from "@/lib/format";
import { fetchTransactionByHash } from "@/lib/zilstream";
import { decodeEvent, formatDecodedArg } from "@/lib/event-decoder";

interface TransactionDetailPageProps {
  params: Promise<{
    hash: string;
  }>;
}

export default async function TransactionDetailPage({
  params,
}: TransactionDetailPageProps) {
  const { hash } = await params;

  let tx;
  try {
    tx = await fetchTransactionByHash(hash);
  } catch (error) {
    notFound();
  }

  return (
    <div className="flex w-full flex-col gap-4 p-3 md:gap-6 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Transaction Details</h1>
          <p className="text-muted-foreground font-mono text-sm break-all">
            {tx.hash}
          </p>
        </div>
        <ExplorerDropdown type="tx" value={tx.hash} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
          <CardDescription>Basic transaction information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <DetailRow label="Transaction Hash" value={tx.hash} />
          <DetailRow
            label="Status"
            value={
              <Badge variant={tx.status === 0 ? "default" : "destructive"}>
                {tx.status === 0 ? "Success" : "Failed"}
              </Badge>
            }
          />
          <DetailRow
            label="Block Number"
            value={
              <Link
                href={`/block/${tx.blockNumber}`}
                className="text-primary hover:underline"
              >
                {formatNumber(tx.blockNumber, 0)}
              </Link>
            }
          />
          <DetailRow
            label="Transaction Index"
            value={formatNumber(tx.transactionIndex, 0)}
          />
          <DetailRow label="Timestamp" value={formatTimestamp(tx.timestamp)} />
          <DetailRow
            label="Transaction Type"
            value={getTransactionType(tx.transactionType, tx.originalTypeHex)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Addresses</CardTitle>
          <CardDescription>From and to addresses</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <DetailRow label="From" value={tx.fromAddress} />
          <DetailRow
            label="To"
            value={
              tx.toAddress ?? (
                <span className="text-muted-foreground">
                  Contract Creation
                  {tx.contractAddress && ` (${tx.contractAddress})`}
                </span>
              )
            }
          />
          {tx.contractAddress && (
            <DetailRow label="Contract Address" value={tx.contractAddress} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Value & Gas</CardTitle>
          <CardDescription>
            Transaction value and gas information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <DetailRow
            label="Value"
            value={`${formatTokenAmount(tx.value, 18, 6)} ZIL`}
          />
          <DetailRow label="Nonce" value={formatNumber(tx.nonce, 0)} />
          <DetailRow label="Gas Used" value={formatNumber(tx.gasUsed, 0)} />
          <DetailRow label="Gas Limit" value={formatNumber(tx.gasLimit, 0)} />
          <DetailRow
            label="Gas Price"
            value={`${formatNumber(Number.parseFloat(tx.gasPrice) / 1e9, 2)} Gwei`}
          />
          <DetailRow
            label="Effective Gas Price"
            value={`${formatNumber(Number.parseFloat(tx.effectiveGasPrice) / 1e9, 2)} Gwei`}
          />
          {tx.maxFeePerGas && (
            <DetailRow
              label="Max Fee Per Gas"
              value={`${formatNumber(Number.parseFloat(tx.maxFeePerGas) / 1e9, 2)} Gwei`}
            />
          )}
          {tx.maxPriorityFeePerGas && (
            <DetailRow
              label="Max Priority Fee Per Gas"
              value={`${formatNumber(Number.parseFloat(tx.maxPriorityFeePerGas) / 1e9, 2)} Gwei`}
            />
          )}
          <DetailRow
            label="Cumulative Gas Used"
            value={formatNumber(tx.cumulativeGasUsed, 0)}
          />
        </CardContent>
      </Card>

      {tx.events && tx.events.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Events</CardTitle>
            <CardDescription>
              {tx.events.length} event{tx.events.length !== 1 ? "s" : ""} emitted
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {tx.events.map((event, index) => {
              const decoded = decodeEvent(event);
              return (
                <div
                  key={event.logIndex}
                  className="space-y-3 border-b border-border/60 pb-6 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Event {index}</Badge>
                    {decoded && (
                      <Badge variant="default">{decoded.eventName}</Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      Log Index: {event.logIndex}
                    </span>
                  </div>
                  <DetailRow label="Address" value={event.address} />
                  
                  {decoded ? (
                    <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
                      <dt className="min-w-48 text-sm font-medium text-muted-foreground">
                        Decoded Arguments
                      </dt>
                      <dd className="flex-1 space-y-2 text-sm">
                        {Object.entries(decoded.args).map(([key, value]) => (
                          <div key={key} className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground font-medium">
                              {key}
                            </span>
                            <span className="font-mono break-all text-foreground">
                              {formatDecodedArg(value)}
                            </span>
                          </div>
                        ))}
                      </dd>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
                        <dt className="min-w-48 text-sm font-medium text-muted-foreground">
                          Topics
                        </dt>
                        <dd className="flex-1 space-y-1 text-sm">
                          {event.topics.map((topic, i) => (
                            <div key={i} className="font-mono break-all">
                              {i}: {topic}
                            </div>
                          ))}
                        </dd>
                      </div>
                      <DetailRow label="Data" value={event.data} />
                    </>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <Link href="/txs" className="text-sm text-primary hover:underline">
        ← Back to transactions
      </Link>
    </div>
  );
}

function getTransactionType(type: number, originalTypeHex: string | null) {
  if (type >= 1000) {
    return "Zilliqa Legacy";
  }

  const types = ["Legacy", "EIP-2930", "EIP-1559", "Type 3"];
  return types[type] ?? `Type ${type}`;
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | React.ReactNode;
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
