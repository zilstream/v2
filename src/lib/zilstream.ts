const API_BASE_URL = "https://v2-api.zilstream.com";

interface ApiPagination {
  page: number;
  per_page: number;
  has_next: boolean;
}

interface ApiListResponse<T> {
  data: T[];
  pagination: ApiPagination;
}

export interface Pagination {
  page: number;
  perPage: number;
  hasNext: boolean;
}

interface TokenResponse {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  price_usd?: string;
  total_volume_usd?: string;
}

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  priceUsd?: string;
  totalVolumeUsd?: string;
}

interface PairResponse {
  protocol: string;
  address: string;
  token0: string;
  token1: string;
  token0_symbol: string;
  token0_name: string;
  token1_symbol: string;
  token1_name: string;
  reserve0: string;
  reserve1: string;
  liquidity_usd: string;
  volume_usd: string;
  txn_count: number;
}

export interface Pair {
  protocol: string;
  address: string;
  token0: string;
  token1: string;
  token0Symbol: string;
  token0Name: string;
  token1Symbol: string;
  token1Name: string;
  reserve0: string;
  reserve1: string;
  liquidityUsd: string;
  volumeUsd: string;
  txnCount: number;
}

interface PairEventResponse {
  protocol: string;
  event_type: "mint" | "swap" | "burn" | string;
  id: string;
  transaction_hash: string;
  log_index: number;
  block_number: number;
  timestamp: number;
  address: string;
  sender?: string;
  to_address?: string;
  recipient?: string;
  amount0_in?: string;
  amount1_in?: string;
  amount0_out?: string;
  amount1_out?: string;
  liquidity?: string;
  amount_usd?: string;
}

export interface PairEvent {
  protocol: string;
  eventType: string;
  id: string;
  transactionHash: string;
  logIndex: number;
  blockNumber: number;
  timestamp: number;
  address: string;
  sender?: string;
  toAddress?: string;
  recipient?: string;
  amount0In?: string;
  amount1In?: string;
  amount0Out?: string;
  amount1Out?: string;
  liquidity?: string;
  amountUsd?: string;
}

export interface TokenListResponse {
  data: Token[];
  pagination: Pagination;
}

export interface PairListResponse {
  data: Pair[];
  pagination: Pagination;
}

export interface PairEventsResponse {
  data: PairEvent[];
  pagination: Pagination;
}

async function fetchFromApi<TResponse>(path: string): Promise<TResponse> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      accept: "application/json",
    },
    // Refresh data roughly once a minute while keeping ISR benefits.
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`ZilStream API request failed with status ${res.status}`);
  }

  return res.json() as Promise<TResponse>;
}

function mapPagination(pagination: ApiPagination): Pagination {
  return {
    page: pagination.page,
    perPage: pagination.per_page,
    hasNext: pagination.has_next,
  };
}

function mapToken(token: TokenResponse): Token {
  return {
    address: token.address,
    symbol: token.symbol,
    name: token.name,
    decimals: token.decimals,
    priceUsd: token.price_usd,
    totalVolumeUsd: token.total_volume_usd,
  };
}

function mapPair(pair: PairResponse): Pair {
  return {
    protocol: normalizeProtocolName(pair.protocol),
    address: pair.address,
    token0: pair.token0,
    token1: pair.token1,
    token0Symbol: pair.token0_symbol,
    token0Name: pair.token0_name,
    token1Symbol: pair.token1_symbol,
    token1Name: pair.token1_name,
    reserve0: pair.reserve0,
    reserve1: pair.reserve1,
    liquidityUsd: pair.liquidity_usd,
    volumeUsd: pair.volume_usd,
    txnCount: pair.txn_count,
  };
}

function mapPairEvent(event: PairEventResponse): PairEvent {
  return {
    protocol: normalizeProtocolName(event.protocol),
    eventType: event.event_type,
    id: event.id,
    transactionHash: event.transaction_hash,
    logIndex: event.log_index,
    blockNumber: event.block_number,
    timestamp: event.timestamp,
    address: event.address,
    sender: event.sender,
    toAddress: event.to_address,
    recipient: event.recipient,
    amount0In: event.amount0_in,
    amount1In: event.amount1_in,
    amount0Out: event.amount0_out,
    amount1Out: event.amount1_out,
    liquidity: event.liquidity,
    amountUsd: event.amount_usd,
  };
}

function normalizeProtocolName(protocol: string) {
  switch (protocol) {
    case "uniswap_v2":
    case "uniswap-v2":
      return "PlunderSwap V2";
    case "uniswap_v3":
    case "uniswap-v3":
      return "PlunderSwap V3";
    default:
      return protocol;
  }
}

export async function fetchTokens(): Promise<TokenListResponse> {
  const data = await fetchFromApi<ApiListResponse<TokenResponse>>("/tokens");

  return {
    data: data.data.map(mapToken),
    pagination: mapPagination(data.pagination),
  };
}

export async function fetchPairs(): Promise<PairListResponse> {
  const data = await fetchFromApi<ApiListResponse<PairResponse>>("/pairs");

  const filteredPairs = data.data.filter((pair) => {
    const liquidity = Number.parseFloat(pair.liquidity_usd ?? "0");
    return !Number.isFinite(liquidity) || liquidity <= 1_000_000;
  });

  return {
    data: filteredPairs.map(mapPair),
    pagination: mapPagination(data.pagination),
  };
}

export async function fetchPairEvents(
  pairAddress: string,
): Promise<PairEventsResponse> {
  const data = await fetchFromApi<ApiListResponse<PairEventResponse>>(
    `/pairs/${pairAddress}/events`,
  );

  return {
    data: data.data.map(mapPairEvent),
    pagination: mapPagination(data.pagination),
  };
}

export async function findPairByAddress(
  pairAddress: string,
): Promise<Pair | undefined> {
  const data = await fetchFromApi<ApiListResponse<PairResponse>>("/pairs");
  const match = data.data.find(
    (pair) => pair.address.toLowerCase() === pairAddress.toLowerCase(),
  );
  return match ? mapPair(match) : undefined;
}

export { API_BASE_URL };
