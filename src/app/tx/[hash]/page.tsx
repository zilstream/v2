import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatNumber, formatTokenAmount } from "@/lib/format";
import { EXPLORER_URL } from "@/lib/constants";
import { fetchTransactionByHash } from "@/lib/zilstream";

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
    <div className="flex w-full flex-col gap-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Transaction Details</h1>
        <p className="text-muted-foreground font-mono text-sm break-all">
          {tx.hash}
        </p>
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

      <div className="flex gap-4">
        <Link
          href={`${EXPLORER_URL}/tx/${tx.hash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline"
        >
          View on Explorer →
        </Link>
        <Link href="/txs" className="text-sm text-primary hover:underline">
          ← Back to transactions
        </Link>
      </div>
    </div>
  );
}

function getTransactionType(type: number, originalTypeHex: string | null) {
  if (type >= 1000) {
    return `Zilliqa Pre-EVM (Type ${originalTypeHex ?? type - 1000})`;
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
