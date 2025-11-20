import Link from "next/link";

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
import { formatNumber, formatUsd } from "@/lib/format";
import { fetchTokens } from "@/lib/zilstream";

export default async function TokensPage() {
  const { data: tokens, pagination } = await fetchTokens();

  return (
    <div className="flex w-full flex-col gap-4 p-3 md:gap-6 md:p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Tokens</h1>
        <p className="text-muted-foreground">
          Listing of assets returned by the ZilStream API token endpoint.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tokens</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/60">
                <TableHead className="px-6">Token</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">24h %</TableHead>
                <TableHead className="text-right">7d %</TableHead>
                <TableHead className="text-right">Market Cap</TableHead>
                <TableHead className="text-right">Volume (24h)</TableHead>
                <TableHead className="text-right">Liquidity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tokens.map((token) => (
                <TableRow key={token.address}>
                  <TableCell className="px-6">
                    <Link
                      href={`/tokens/${token.address}`}
                      className="flex items-center gap-3 transition hover:opacity-80"
                    >
                      <TokenIcon
                        address={token.address}
                        alt={token.symbol ?? token.name ?? "Token"}
                        size={36}
                      />
                      <div className="font-medium">
                        {token.name ?? "-"}{" "}
                        {token.symbol && (
                          <span className="text-muted-foreground">
                            {token.symbol}
                          </span>
                        )}
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="text-right">
                    {token.priceUsd ? formatUsd(token.priceUsd) : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    {token.priceChange24h &&
                    Number.parseFloat(token.priceChange24h) !== 0 ? (
                      <span
                        className={
                          Number.parseFloat(token.priceChange24h) >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {Number.parseFloat(token.priceChange24h) >= 0
                          ? "+"
                          : ""}
                        {formatNumber(token.priceChange24h, 2)}%
                      </span>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {token.priceChange7d &&
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
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {token.marketCapUsd ? formatUsd(token.marketCapUsd) : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    {token.volume24hUsd ? formatUsd(token.volume24hUsd) : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    {token.liquidityUsd ? formatUsd(token.liquidityUsd) : "-"}
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

function shortenAddress(address: string) {
  if (!address) return "";
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
