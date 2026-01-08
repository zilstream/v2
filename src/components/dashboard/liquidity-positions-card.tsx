"use client";

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
import { Badge } from "@/components/ui/badge";
import { TokenIcon } from "@/components/token-icon";
import { formatTokenAmount, formatUsd, formatNumber } from "@/lib/format";
import type { LPPositionV2, LPPositionV3 } from "@/lib/types/dashboard";

interface LiquidityPositionsCardProps {
  positionsV2: LPPositionV2[];
  positionsV3: LPPositionV3[];
  isLoading?: boolean;
}

function formatFeeTier(fee: number): string {
  if (fee === 100) return "0.01%";
  if (fee === 500) return "0.05%";
  if (fee === 3000) return "0.3%";
  if (fee === 10000) return "1%";
  return `${fee / 10000}%`;
}

export function LiquidityPositionsCard({
  positionsV2,
  positionsV3,
  isLoading,
}: LiquidityPositionsCardProps) {
  const v2Total = positionsV2.reduce((sum, p) => sum + p.valueUsd, 0);
  const v3Total = positionsV3.reduce((sum, p) => sum + p.valueUsd + p.feesUsd, 0);
  const totalValue = v2Total + v3Total;

  const hasV2 = positionsV2.length > 0;
  const hasV3 = positionsV3.length > 0;
  const isEmpty = !hasV2 && !hasV3;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Liquidity Positions</CardTitle>
        <CardAction>
          <span className="text-sm text-muted-foreground">
            {formatUsd(totalValue)}
          </span>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-6">
        {isEmpty && (
          <div className="py-8 text-center text-muted-foreground">
            No liquidity positions found
          </div>
        )}

        {/* V3 Positions */}
        {hasV3 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium">PlunderSwap V3</h4>
              <Badge variant="secondary" className="text-xs">
                {formatUsd(v3Total)}
              </Badge>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pool</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                  <TableHead className="text-right">Token Amounts</TableHead>
                  <TableHead className="text-right">Fees</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positionsV3.map((position) => (
                  <TableRow key={position.tokenId.toString()}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-1">
                          <TokenIcon
                            address={position.token0.address}
                            alt={position.token0.symbol}
                            size={24}
                          />
                          <TokenIcon
                            address={position.token1.address}
                            alt={position.token1.symbol}
                            size={24}
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {position.token0.symbol}/{position.token1.symbol}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatFeeTier(position.feeTier)}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={position.inRange ? "default" : "secondary"}
                        className={
                          position.inRange
                            ? "bg-green-500/10 text-green-600 hover:bg-green-500/20"
                            : "bg-orange-500/10 text-orange-600 hover:bg-orange-500/20"
                        }
                      >
                        {position.inRange ? "In Range" : "Out of Range"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end text-sm">
                        <span>
                          {formatTokenAmount(
                            position.token0Amount,
                            position.token0.decimals,
                            4
                          )}{" "}
                          {position.token0.symbol}
                        </span>
                        <span className="text-muted-foreground">
                          {formatTokenAmount(
                            position.token1Amount,
                            position.token1.decimals,
                            4
                          )}{" "}
                          {position.token1.symbol}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {position.feesUsd > 0.01 ? (
                        <div className="flex flex-col items-end text-sm text-green-600">
                          <span>{formatUsd(position.feesUsd)}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatUsd(position.valueUsd)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* V2 Positions */}
        {hasV2 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium">PlunderSwap V2</h4>
              <Badge variant="secondary" className="text-xs">
                {formatUsd(v2Total)}
              </Badge>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pool</TableHead>
                  <TableHead className="text-right">Share</TableHead>
                  <TableHead className="text-right">Token Amounts</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positionsV2.map((position) => (
                  <TableRow key={position.pairAddress}>
                    <TableCell>
                      <Link
                        href={`/pairs/${position.pairAddress}`}
                        className="flex items-center gap-2 hover:underline"
                      >
                        <div className="flex -space-x-1">
                          <TokenIcon
                            address={position.token0.address}
                            alt={position.token0.symbol}
                            size={24}
                          />
                          <TokenIcon
                            address={position.token1.address}
                            alt={position.token1.symbol}
                            size={24}
                          />
                        </div>
                        <span className="font-medium">
                          {position.token0.symbol}/{position.token1.symbol}
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatNumber(position.sharePercent * 100, 4)}%
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end text-sm">
                        <span>
                          {formatTokenAmount(position.token0Amount, 18, 4)}{" "}
                          {position.token0.symbol}
                        </span>
                        <span className="text-muted-foreground">
                          {formatTokenAmount(position.token1Amount, 18, 4)}{" "}
                          {position.token1.symbol}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatUsd(position.valueUsd)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
