import { ExternalLink } from "lucide-react";
import Link from "next/link";

import { CopyAddress } from "@/components/copy-address";
import { TokenIcon } from "@/components/token-icon";
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
import { EXPLORER_URL } from "@/lib/constants";
import { formatNumber, formatUsd } from "@/lib/format";
import {
  fetchTokenByAddress,
  fetchTokenPairs,
} from "@/lib/zilstream";

export default async function TokenDetailPage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = await params;

  const [token, pairsResponse] = await Promise.all([
    fetchTokenByAddress(address),
    fetchTokenPairs(address),
  ]);

  const { data: pairs } = pairsResponse;

  return (
    <div className="flex w-full flex-col gap-4 p-3 md:gap-6 md:p-6">
      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <TokenIcon
              address={token.address}
              alt={token.symbol ?? token.name ?? "Token"}
              size={56}
            />
            <div>
              <CardTitle className="text-2xl">
                {token.name ?? "Unknown Token"}
              </CardTitle>
              <CardDescription className="text-base">
                {token.symbol ?? "-"}
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <CopyAddress address={token.address} />
            <Link
              href={`${EXPLORER_URL}/address/${token.address}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-sm font-medium transition hover:bg-muted"
            >
              View on Explorer
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatBlock
            label="Price"
            value={token.priceUsd ? formatUsd(token.priceUsd) : "-"}
          />
          <StatBlock
            label="Market Cap"
            value={token.marketCapUsd ? formatUsd(token.marketCapUsd) : "-"}
          />
          <StatBlock
            label="24h Volume"
            value={token.volume24hUsd ? formatUsd(token.volume24hUsd) : "-"}
          />
          <StatBlock
            label="Liquidity"
            value={token.liquidityUsd ? formatUsd(token.liquidityUsd) : "-"}
          />
          <StatBlock
            label="24h Change"
            value={
              token.priceChange24h ? (
                <span
                  className={
                    Number.parseFloat(token.priceChange24h) >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {Number.parseFloat(token.priceChange24h) >= 0 ? "+" : ""}
                  {formatNumber(token.priceChange24h, 2)}%
                </span>
              ) : (
                "-"
              )
            }
          />
          <StatBlock
            label="7d Change"
            value={
              token.priceChange7d ? (
                <span
                  className={
                    Number.parseFloat(token.priceChange7d) >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {Number.parseFloat(token.priceChange7d) >= 0 ? "+" : ""}
                  {formatNumber(token.priceChange7d, 2)}%
                </span>
              ) : (
                "-"
              )
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trading Pairs</CardTitle>
          <CardDescription>
            All trading pairs for {token.symbol ?? token.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/60">
                <TableHead className="px-6">Pair</TableHead>
                <TableHead>Protocol</TableHead>
                <TableHead className="text-right">Liquidity</TableHead>
                <TableHead className="text-right">Volume (24h)</TableHead>
                <TableHead className="text-right">Transactions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pairs.map((pair) => (
                <TableRow key={pair.address}>
                  <TableCell className="px-6">
                    <div className="flex items-center gap-3">
                      <div className="flex shrink-0 -space-x-2">
                        <TokenIcon
                          address={pair.token0}
                          alt={pair.token0Symbol}
                          size={28}
                          className="ring-2 ring-background"
                        />
                        <TokenIcon
                          address={pair.token1}
                          alt={pair.token1Symbol}
                          size={28}
                          className="ring-2 ring-background"
                        />
                      </div>
                      <div className="font-medium">
                        {pair.token0Symbol} / {pair.token1Symbol}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {pair.protocol}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatUsd(pair.liquidityUsd)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatUsd(pair.volumeUsd24h)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(pair.txnCount, 0)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/pairs/${pair.address}`}
                      className="text-primary underline underline-offset-4"
                    >
                      View
                    </Link>
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

interface StatBlockProps {
  label: string;
  value: string | React.ReactNode;
}

function StatBlock({ label, value }: StatBlockProps) {
  return (
    <div className="rounded-lg border border-border/60 bg-secondary/20 p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}
