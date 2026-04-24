import { TokensTable } from "@/components/tokens-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTableParams } from "@/hooks/use-table-params";
import { useTokens } from "@/hooks/use-zilstream-queries";

const TOKEN_SORT_DEFAULT = { sortBy: "liquidity", sortOrder: "desc" } as const;

export function TokensTableClient() {
  const { search, sortBy, sortOrder, setSearch, toggleSort } =
    useTableParams(TOKEN_SORT_DEFAULT);
  const { data, isLoading } = useTokens(1, 100, {
    search: search || undefined,
    sortBy,
    sortOrder,
  });
  const tokens = data?.data ?? [];

  if (isLoading && tokens.length === 0 && !search) {
    return <TokensTableSkeleton />;
  }

  return (
    <TokensTable
      tokens={tokens}
      search={search}
      onSearchChange={setSearch}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSortChange={toggleSort}
    />
  );
}

function TokensTableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tokens</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow className="border-border/60">
              <TableHead className="w-12 pl-6 pr-0" />
              <TableHead>Token</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Price (ZIL)</TableHead>
              <TableHead className="text-right">24h %</TableHead>
              <TableHead className="text-right">7d %</TableHead>
              <TableHead className="text-right">Market Cap</TableHead>
              <TableHead className="text-right">Volume (24h)</TableHead>
              <TableHead className="text-right">Liquidity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 10 }, (_, i) => `row-${i}`).map((key) => (
              <TableRow key={key}>
                <TableCell className="pl-6 pr-0">
                  <Skeleton className="h-8 w-8 rounded" />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="ml-auto h-4 w-16" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="ml-auto h-4 w-16" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="ml-auto h-4 w-12" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="ml-auto h-4 w-12" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="ml-auto h-4 w-20" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="ml-auto h-4 w-16" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="ml-auto h-4 w-16" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
