import type { Address } from "viem";

export interface TokenBalance {
  address: Address;
  symbol: string;
  name: string;
  decimals: number;
  balance: bigint;
  priceUsd: number;
  valueUsd: number;
}

export interface LiquidStakingPosition {
  validatorName: string;
  validatorAddress: Address;
  validatorIcon: string;
  lstToken: {
    address: Address;
    symbol: string;
    balance: bigint;
    decimals: number;
  };
  exchangeRate: bigint;
  zilEquivalent: bigint;
  valueUsd: number;
}

export interface NonLiquidStakingPosition {
  validatorName: string;
  validatorAddress: Address;
  validatorIcon: string;
  delegatedAmount: bigint;
  rewards: bigint;
  claimable: bigint;
  valueUsd: number;
}

export interface LPPositionV2 {
  pairAddress: Address;
  token0: { address: Address; symbol: string };
  token1: { address: Address; symbol: string };
  lpBalance: bigint;
  totalSupply: bigint;
  reserve0: bigint;
  reserve1: bigint;
  token0Amount: bigint;
  token1Amount: bigint;
  sharePercent: number;
  valueUsd: number;
}

export interface LPPositionV3 {
  tokenId: bigint;
  poolAddress: Address;
  token0: { address: Address; symbol: string; decimals: number };
  token1: { address: Address; symbol: string; decimals: number };
  feeTier: number;
  tickLower: number;
  tickUpper: number;
  currentTick: number;
  inRange: boolean;
  liquidity: bigint;
  token0Amount: bigint;
  token1Amount: bigint;
  uncollectedFees0: bigint;
  uncollectedFees1: bigint;
  valueUsd: number;
  feesUsd: number;
}

export interface PortfolioBreakdown {
  native: number;
  tokens: number;
  liquidStaking: number;
  nonLiquidStaking: number;
  liquidity: number;
}
