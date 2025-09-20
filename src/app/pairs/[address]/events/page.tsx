import Link from "next/link";
import { notFound } from "next/navigation";

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
import {
  formatNumber,
  formatTimestamp,
  formatTokenAmount,
  formatUsd,
} from "@/lib/format";
import {
  fetchPairEvents,
  fetchTokens,
  findPairByAddress,
} from "@/lib/zilstream";

interface PairEventsPageProps {
  params: {
    address: string;
  };
}

export default async function PairEventsPage({ params }: PairEventsPageProps) {
  const pairAddress = params.address;

  const [eventsResponse, pair, tokensResponse] = await Promise.all([
    fetchPairEvents(pairAddress),
    findPairByAddress(pairAddress),
    fetchTokens(),
  ]);

  if (!pair) {
    notFound();
  }

  const { data: events, pagination } = eventsResponse;
  const tokenIndex = new Map(
    tokensResponse.data.map((token) => [token.address.toLowerCase(), token]),
  );
  const token0Decimals = tokenIndex.get(pair.token0.toLowerCase())?.decimals;
  const token1Decimals = tokenIndex.get(pair.token1.toLowerCase())?.decimals;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Pair Events</h1>
        <p className="text-muted-foreground">
          Recent events for the selected liquidity pool.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <TokenIcon
                address={pair.token0}
                alt={pair.token0Symbol}
                size={40}
                className="ring-2 ring-background"
              />
              <TokenIcon
                address={pair.token1}
                alt={pair.token1Symbol}
                size={40}
                className="ring-2 ring-background"
              />
            </div>
            <div>
              <CardTitle>
                {pair.token0Symbol} / {pair.token1Symbol}
              </CardTitle>
              <CardDescription>
                {pair.token0Name} • {pair.token1Name}
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="capitalize">
              {pair.protocol}
            </Badge>
            <Badge variant="secondary">{pair.address}</Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <StatBlock
            label="Liquidity USD"
            value={formatUsd(pair.liquidityUsd)}
          />
          <StatBlock label="24h Volume USD" value={formatUsd(pair.volumeUsd)} />
          <StatBlock
            label="Transactions"
            value={formatNumber(pair.txnCount, 0)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Events</CardTitle>
            <CardDescription>
              {`Page ${pagination.page} • Showing up to ${pagination.perPage} events`}
            </CardDescription>
          </div>
          <Badge variant={pagination.hasNext ? "secondary" : "outline"}>
            {pagination.hasNext ? "More available" : "End of list"}
          </Badge>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/60">
                <TableHead className="px-6">Event</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead className="text-right">Token</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Amount (USD)</TableHead>
                <TableHead>Transaction</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => {
                const amount = getRelevantAmount(event);
                const tokenDecimals =
                  amount?.token === 0 ? token0Decimals : token1Decimals;
                const tokenSymbol =
                  amount?.token === 0 ? pair.token0Symbol : pair.token1Symbol;

                return (
                  <TableRow key={event.id}>
                    <TableCell className="px-6">
                      <Badge variant="outline" className="capitalize">
                        {event.eventType}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatTimestamp(event.timestamp)}</TableCell>
                    <TableCell className="text-right">
                      {tokenSymbol ?? "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatTokenAmount(amount?.value, tokenDecimals)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatUsd(event.amountUsd, 4)}
                    </TableCell>
                    <TableCell>
                      <Link
                        className="text-primary underline underline-offset-4"
                        href={`https://otterscan.zilliqa.com/tx/${event.transactionHash}`}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {event.transactionHash.slice(0, 6)}…
                        {event.transactionHash.slice(-4)}
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

interface StatBlockProps {
  label: string;
  value: string;
}

function StatBlock({ label, value }: StatBlockProps) {
  return (
    <div className="rounded-lg border border-border/60 bg-secondary/20 p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}

function getRelevantAmount(event: {
  eventType: string;
  amount0In?: string;
  amount0Out?: string;
  amount1In?: string;
  amount1Out?: string;
}): { token: 0 | 1; value?: string } | undefined {
  const type = event.eventType.toLowerCase();

  if (type === "swap") {
    if (event.amount0In && event.amount0In !== "0") {
      return { token: 0, value: event.amount0In };
    }
    if (event.amount1In && event.amount1In !== "0") {
      return { token: 1, value: event.amount1In };
    }
    if (event.amount0Out && event.amount0Out !== "0") {
      return { token: 0, value: event.amount0Out };
    }
    if (event.amount1Out && event.amount1Out !== "0") {
      return { token: 1, value: event.amount1Out };
    }
    return { token: 0, value: undefined };
  }

  if (type === "mint") {
    if (event.amount0In && event.amount0In !== "0") {
      return { token: 0, value: event.amount0In };
    }
    if (event.amount1In && event.amount1In !== "0") {
      return { token: 1, value: event.amount1In };
    }
    return { token: 0, value: undefined };
  }

  if (type === "burn") {
    if (event.amount0Out && event.amount0Out !== "0") {
      return { token: 0, value: event.amount0Out };
    }
    if (event.amount1Out && event.amount1Out !== "0") {
      return { token: 1, value: event.amount1Out };
    }
    return { token: 0, value: undefined };
  }

  if (event.amount0In && event.amount0In !== "0") {
    return { token: 0, value: event.amount0In };
  }
  if (event.amount1In && event.amount1In !== "0") {
    return { token: 1, value: event.amount1In };
  }
  if (event.amount0Out && event.amount0Out !== "0") {
    return { token: 0, value: event.amount0Out };
  }
  if (event.amount1Out && event.amount1Out !== "0") {
    return { token: 1, value: event.amount1Out };
  }

  return undefined;
}
