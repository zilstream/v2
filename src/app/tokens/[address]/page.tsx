import Link from "next/link";

import { CopyAddress } from "@/components/copy-address";
import { ExplorerDropdown } from "@/components/explorer-dropdown";
import { TokenIcon } from "@/components/token-icon";
import { TokenPriceChart } from "@/components/token-price-chart";
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
import {
  formatNumber,
  formatPriceUsd,
  formatUsd,
  formatZilPrice,
} from "@/lib/format";
import {
  fetchTokenByAddress,
  fetchTokenChart,
  fetchTokenPairs,
} from "@/lib/zilstream";

export default async function TokenDetailPage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = await params;

  const [token, pairsResponse, chartData] = await Promise.all([
    fetchTokenByAddress(address),
    fetchTokenPairs(address),
    fetchTokenChart(address),
  ]);

  const { data: pairs } = pairsResponse;

  const volumeToMcap =
    token.volume24hUsd && token.marketCapUsd
      ? (Number.parseFloat(token.volume24hUsd) /
          Number.parseFloat(token.marketCapUsd)) *
        100
      : undefined;

  const liquidityToMcap =
    token.liquidityUsd && token.marketCapUsd
      ? (Number.parseFloat(token.liquidityUsd) /
          Number.parseFloat(token.marketCapUsd)) *
        100
      : undefined;

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
            <ExplorerDropdown type="address" value={token.address} />
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatBlock
            label="Price"
            value={token.priceUsd ? formatPriceUsd(token.priceUsd) : "-"}
          />
          <StatBlock
            label="Price (ZIL)"
            value={
              token.priceEth ? `${formatZilPrice(token.priceEth)} ZIL` : "-"
            }
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
        </CardContent>
      </Card>

      <div className="grid gap-4 md:gap-6 lg:grid-cols-[1fr_300px]">
        <div className="flex flex-col gap-4 md:gap-6">
          <TokenPriceChart data={chartData} symbol={token.symbol} />

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
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pairs.map((pair) => (
                    <TableRow key={pair.address} className="cursor-pointer">
                      <TableCell className="px-6">
                        <Link
                          href={`/pairs/${pair.address}`}
                          className="flex items-center gap-3 transition hover:opacity-80"
                        >
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
                        </Link>
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
                      <TableCell className="text-right text-muted-foreground">
                        →
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailItem
              label="Total Supply"
              value={
                token.totalSupply && token.decimals
                  ? formatNumber(
                      (
                        Number(token.totalSupply) /
                        10 ** token.decimals
                      ).toString(),
                      0,
                    )
                  : "-"
              }
            />
            <DetailItem
              label="Total Volume"
              value={
                token.totalVolumeUsd ? formatUsd(token.totalVolumeUsd) : "-"
              }
            />
            <DetailItem
              label="Volume / Market Cap"
              value={
                volumeToMcap !== undefined
                  ? `${formatNumber(volumeToMcap.toString(), 2)}%`
                  : "-"
              }
            />
            <DetailItem
              label="Liquidity / Market Cap"
              value={
                liquidityToMcap !== undefined
                  ? `${formatNumber(liquidityToMcap.toString(), 2)}%`
                  : "-"
              }
            />
            <DetailItem
              label="24h Change"
              value={
                token.priceChange24h &&
                Number.parseFloat(token.priceChange24h) !== 0 ? (
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
            <DetailItem
              label="7d Change"
              value={
                token.priceChange7d &&
                Number.parseFloat(token.priceChange7d) !== 0 ? (
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
      </div>
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
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

interface DetailItemProps {
  label: string;
  value: string | React.ReactNode;
}

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <div className="flex flex-col gap-1 border-b border-border/60 pb-4 last:border-0 last:pb-0">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
