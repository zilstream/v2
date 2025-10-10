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
    <div className="flex w-full flex-col gap-6 p-6">
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
                <TableHead>Symbol</TableHead>
                <TableHead className="text-right">Decimals</TableHead>
                <TableHead className="text-right">Price (USD)</TableHead>
                <TableHead className="text-right">Total Volume (USD)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tokens.map((token) => (
                <TableRow key={token.address}>
                  <TableCell className="px-6">
                    <div className="flex items-center gap-3">
                      <TokenIcon
                        address={token.address}
                        alt={token.symbol ?? token.name}
                        size={36}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{token.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {shortenAddress(token.address)}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{token.symbol}</TableCell>
                  <TableCell className="text-right">{token.decimals}</TableCell>
                  <TableCell className="text-right">
                    {formatNumber(token.priceUsd, token.priceUsd ? 6 : 2)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatUsd(token.totalVolumeUsd)}
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
