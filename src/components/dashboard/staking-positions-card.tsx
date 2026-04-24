import { TokenIcon } from "@/components/token-icon";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
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
import { formatTokenAmount, formatUsd } from "@/lib/format";
import type {
  LiquidStakingPosition,
  NonLiquidStakingPosition,
} from "@/lib/types/dashboard";

interface StakingPositionsCardProps {
  liquidPositions: LiquidStakingPosition[];
  nonLiquidPositions: NonLiquidStakingPosition[];
  isLoading?: boolean;
}

export function StakingPositionsCard({
  liquidPositions,
  nonLiquidPositions,
}: StakingPositionsCardProps) {
  const liquidTotal = liquidPositions.reduce((sum, p) => sum + p.valueUsd, 0);
  const nonLiquidTotal = nonLiquidPositions.reduce(
    (sum, p) => sum + p.valueUsd,
    0,
  );
  const totalValue = liquidTotal + nonLiquidTotal;

  const hasLiquid = liquidPositions.length > 0;
  const hasNonLiquid = nonLiquidPositions.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Staking Positions</CardTitle>
        <CardAction>
          <span className="text-sm text-muted-foreground">
            {formatUsd(totalValue)}
          </span>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-6">
        {!hasLiquid && !hasNonLiquid && (
          <div className="py-8 text-center text-muted-foreground">
            No staking positions found
          </div>
        )}
        {/* Liquid Staking Section */}
        {hasLiquid && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium">Liquid Staking</h4>
              <Badge variant="secondary" className="text-xs">
                {formatUsd(liquidTotal)}
              </Badge>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Validator</TableHead>
                  <TableHead className="text-right">LST Balance</TableHead>
                  <TableHead className="text-right">ZIL Equivalent</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {liquidPositions.map((position) => (
                  <TableRow key={position.validatorAddress}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TokenIcon
                          address={position.lstToken.address}
                          alt={position.lstToken.symbol}
                          size={24}
                        />
                        <span className="font-medium">
                          {position.validatorName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-muted-foreground">
                        {formatTokenAmount(
                          position.lstToken.balance,
                          position.lstToken.decimals,
                          4,
                        )}{" "}
                        {position.lstToken.symbol}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatTokenAmount(position.zilEquivalent, 18, 2)} ZIL
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

        {/* Non-Liquid Staking Section */}
        {hasNonLiquid && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium">Non-Liquid Staking</h4>
              <Badge variant="secondary" className="text-xs">
                {formatUsd(nonLiquidTotal)}
              </Badge>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Validator</TableHead>
                  <TableHead className="text-right">Delegated</TableHead>
                  <TableHead className="text-right">Rewards</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {nonLiquidPositions.map((position) => (
                  <TableRow key={position.validatorAddress}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ValidatorIcon
                          iconUrl={position.validatorIcon}
                          name={position.validatorName}
                        />
                        <span className="font-medium">
                          {position.validatorName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatTokenAmount(position.delegatedAmount, 18, 2)} ZIL
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {position.rewards > 0n
                        ? `${formatTokenAmount(position.rewards, 18, 4)} ZIL`
                        : "-"}
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

function ValidatorIcon({ iconUrl, name }: { iconUrl: string; name: string }) {
  return (
    <div className="relative h-6 w-6 overflow-hidden rounded-full bg-muted">
      <img
        src={iconUrl}
        alt={name}
        className="absolute inset-0 w-full h-full object-cover"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    </div>
  );
}
