export const ERC20_ABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "from", type: "address" },
      { indexed: true, name: "to", type: "address" },
      { indexed: false, name: "value", type: "uint256" },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "owner", type: "address" },
      { indexed: true, name: "spender", type: "address" },
      { indexed: false, name: "value", type: "uint256" },
    ],
    name: "Approval",
    type: "event",
  },
] as const;

export const UNISWAP_V2_PAIR_ABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "sender", type: "address" },
      { indexed: false, name: "amount0", type: "uint256" },
      { indexed: false, name: "amount1", type: "uint256" },
    ],
    name: "Mint",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "sender", type: "address" },
      { indexed: false, name: "amount0", type: "uint256" },
      { indexed: false, name: "amount1", type: "uint256" },
      { indexed: true, name: "to", type: "address" },
    ],
    name: "Burn",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "sender", type: "address" },
      { indexed: false, name: "amount0In", type: "uint256" },
      { indexed: false, name: "amount1In", type: "uint256" },
      { indexed: false, name: "amount0Out", type: "uint256" },
      { indexed: false, name: "amount1Out", type: "uint256" },
      { indexed: true, name: "to", type: "address" },
    ],
    name: "Swap",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: "reserve0", type: "uint112" },
      { indexed: false, name: "reserve1", type: "uint112" },
    ],
    name: "Sync",
    type: "event",
  },
] as const;

export const UNISWAP_V3_POOL_ABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: "sender", type: "address" },
      { indexed: true, name: "owner", type: "address" },
      { indexed: true, name: "tickLower", type: "int24" },
      { indexed: true, name: "tickUpper", type: "int24" },
      { indexed: false, name: "amount", type: "uint128" },
      { indexed: false, name: "amount0", type: "uint256" },
      { indexed: false, name: "amount1", type: "uint256" },
    ],
    name: "Mint",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "owner", type: "address" },
      { indexed: true, name: "tickLower", type: "int24" },
      { indexed: true, name: "tickUpper", type: "int24" },
      { indexed: false, name: "amount0", type: "uint256" },
      { indexed: false, name: "amount1", type: "uint256" },
    ],
    name: "Burn",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "sender", type: "address" },
      { indexed: true, name: "recipient", type: "address" },
      { indexed: false, name: "amount0", type: "int256" },
      { indexed: false, name: "amount1", type: "int256" },
      { indexed: false, name: "sqrtPriceX96", type: "uint160" },
      { indexed: false, name: "liquidity", type: "uint128" },
      { indexed: false, name: "tick", type: "int24" },
    ],
    name: "Swap",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "owner", type: "address" },
      { indexed: false, name: "recipient", type: "address" },
      { indexed: true, name: "tickLower", type: "int24" },
      { indexed: true, name: "tickUpper", type: "int24" },
      { indexed: false, name: "amount0", type: "uint128" },
      { indexed: false, name: "amount1", type: "uint128" },
    ],
    name: "Collect",
    type: "event",
  },
] as const;

// PlunderSwap (Zilliqa's Uniswap V3 fork) has extra protocol fee parameters
export const PLUNDERSWAP_V3_POOL_ABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "sender", type: "address" },
      { indexed: true, name: "recipient", type: "address" },
      { indexed: false, name: "amount0", type: "int256" },
      { indexed: false, name: "amount1", type: "int256" },
      { indexed: false, name: "sqrtPriceX96", type: "uint160" },
      { indexed: false, name: "liquidity", type: "uint128" },
      { indexed: false, name: "tick", type: "int24" },
      { indexed: false, name: "protocolFeesToken0", type: "uint128" },
      { indexed: false, name: "protocolFeesToken1", type: "uint128" },
    ],
    name: "Swap",
    type: "event",
  },
] as const;

export const ALL_ABIS = [
  ...ERC20_ABI,
  ...UNISWAP_V2_PAIR_ABI,
  ...UNISWAP_V3_POOL_ABI,
  ...PLUNDERSWAP_V3_POOL_ABI,
] as const;
