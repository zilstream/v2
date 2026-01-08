"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TokenIcon } from "@/components/token-icon";
import { formatTokenAmount, formatPriceUsd, formatUsd } from "@/lib/format";
import type { TokenBalance } from "@/lib/types/dashboard";
import { ChevronDown, ChevronUp } from "lucide-react";

interface TokenBalancesCardProps {
  tokens: TokenBalance[];
  isLoading?: boolean;
}

const INITIAL_DISPLAY_COUNT = 5;

export function TokenBalancesCard({
  tokens,
  isLoading,
}: TokenBalancesCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const displayTokens = isExpanded
    ? tokens
    : tokens.slice(0, INITIAL_DISPLAY_COUNT);
  const hasMore = tokens.length > INITIAL_DISPLAY_COUNT;

  const totalValue = tokens
    .filter((t) => t.priceUsd > 0)
    .reduce((sum, t) => sum + t.valueUsd, 0);
  const isEmpty = tokens.length === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Token Balances</CardTitle>
        <CardAction>
          <span className="text-sm text-muted-foreground">
            {formatUsd(totalValue)}
          </span>
        </CardAction>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="py-8 text-center text-muted-foreground">
            No token balances found
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Token</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayTokens.map((token) => (
                  <TableRow key={token.address}>
                    <TableCell>
                      <Link
                        href={`/tokens/${token.address}`}
                        className="flex items-center gap-2 hover:underline"
                      >
                        <TokenIcon
                          address={token.address}
                          alt={token.symbol}
                          size={24}
                        />
                        <span className="font-medium">{token.symbol}</span>
                      </Link>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatTokenAmount(token.balance, token.decimals, 4)}
                    </TableCell>
                    <TableCell className="text-right">
                      {token.priceUsd > 0 ? (
                        formatPriceUsd(token.priceUsd)
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {token.priceUsd > 0 ? (
                        formatUsd(token.valueUsd)
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {hasMore && (
              <div className="mt-4 flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="gap-1"
                >
                  {isExpanded ? (
                    <>
                      Show Less <ChevronUp className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Show {tokens.length - INITIAL_DISPLAY_COUNT} More{" "}
                      <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
