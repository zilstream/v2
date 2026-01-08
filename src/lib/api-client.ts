// Client-side API wrapper for direct browser-to-API calls
// Reuses types from zilstream.ts, provides browser-compatible fetch

export const API_BASE_URL = "https://api-v2.zilstream.com";
export const API_V2_BASE_URL = "https://v2-api.zilstream.com";

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

// Re-export types for client use
export type {
  Token,
  Pair,
  PairEvent,
  Stats,
  Block,
  Transaction,
  TokenChartData,
  TokenListResponse,
  PairListResponse,
  PairEventsResponse,
  BlockListResponse,
  TransactionListResponse,
} from "./zilstream";

// Import response types for mapping
interface TokenResponse {
  address: string;
  symbol?: string;
  name?: string;
  decimals?: number;
  total_supply?: string;
  price_usd?: string;
  price_eth?: string;
  market_cap_usd?: string;
  liquidity_usd?: string;
  volume_24h_usd?: string;
  total_volume_usd?: string;
  price_change_24h?: string;
  price_change_7d?: string;
  first_seen_block?: number;
  first_seen_timestamp?: number;
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
  fee?: string;
  reserve0: string;
  reserve1: string;
  liquidity_usd: string;
  volume_usd: string;
  volume_usd_24h: string;
  txn_count: number;
  price_change_24h?: string;
  price_change_7d?: string;
  price_usd?: string;
  price_eth?: string;
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
  maker?: string;
}

interface BlockResponse {
  number: number;
  hash: string;
  parent_hash: string;
  timestamp: number;
  gas_limit: number;
  gas_used: number;
  base_fee_per_gas: string;
  transaction_count: number;
  transactions?: TransactionResponse[];
}

interface TransactionResponse {
  hash: string;
  block_number: number;
  transaction_index: number;
  from_address: string;
  to_address: string | null;
  value: string;
  gas_price: string;
  gas_limit: number;
  gas_used: number;
  nonce: number;
  status: number;
  transaction_type: number;
  original_type_hex: string | null;
  max_fee_per_gas: string | null;
  max_priority_fee_per_gas: string | null;
  effective_gas_price: string;
  contract_address: string | null;
  cumulative_gas_used: number;
  timestamp: number;
  events?: TransactionEventResponse[];
}

interface TransactionEventResponse {
  log_index: number;
  address: string;
  topics: string[];
  data: string;
  transaction_index: number;
  block_number: number;
}

interface StatsResponse {
  data: {
    total_pairs: number;
    total_tokens: number;
    total_liquidity_usd: string;
    total_volume_usd_24h: string;
    total_volume_usd_all: string;
    zil_price_usd: string;
    zil_price_change_24h: string;
  };
}

// Import types for return values
import type {
  Token,
  Pair,
  PairEvent,
  Stats,
  Block,
  Transaction,
  TokenChartData,
  TokenListResponse,
  PairListResponse,
  PairEventsResponse,
  BlockListResponse,
  TransactionListResponse,
} from "./zilstream";

// Browser-compatible fetch wrapper
async function fetchFromApi<TResponse>(
  path: string,
  baseUrl = API_BASE_URL,
): Promise<TResponse> {
  const res = await fetch(`${baseUrl}${path}`, {
    headers: { accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json() as Promise<TResponse>;
}

// Mapping functions
function mapPagination(pagination: ApiPagination): Pagination {
  return {
    page: pagination.page,
    perPage: pagination.per_page,
    hasNext: pagination.has_next,
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

function mapToken(token: TokenResponse): Token {
  return {
    address: token.address,
    symbol: token.symbol,
    name: token.name,
    decimals: token.decimals,
    totalSupply: token.total_supply,
    priceUsd: token.price_usd,
    priceEth: token.price_eth,
    marketCapUsd: token.market_cap_usd,
    liquidityUsd: token.liquidity_usd,
    volume24hUsd: token.volume_24h_usd,
    totalVolumeUsd: token.total_volume_usd,
    priceChange24h: token.price_change_24h,
    priceChange7d: token.price_change_7d,
    firstSeenBlock: token.first_seen_block,
    firstSeenTimestamp: token.first_seen_timestamp,
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
    fee: pair.fee,
    reserve0: pair.reserve0,
    reserve1: pair.reserve1,
    liquidityUsd: pair.liquidity_usd,
    volumeUsd: pair.volume_usd,
    volumeUsd24h: pair.volume_usd_24h,
    txnCount: pair.txn_count,
    priceChange24h: pair.price_change_24h,
    priceChange7d: pair.price_change_7d,
    priceUsd: pair.price_usd,
    priceEth: pair.price_eth,
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
    maker: event.maker,
  };
}

function mapBlock(block: BlockResponse): Block {
  return {
    number: block.number,
    hash: block.hash,
    parentHash: block.parent_hash,
    timestamp: block.timestamp,
    gasLimit: block.gas_limit,
    gasUsed: block.gas_used,
    baseFeePerGas: block.base_fee_per_gas,
    transactionCount: block.transaction_count,
    transactions: block.transactions?.map(mapTransaction),
  };
}

function mapTransaction(tx: TransactionResponse): Transaction {
  return {
    hash: tx.hash,
    blockNumber: tx.block_number,
    transactionIndex: tx.transaction_index,
    fromAddress: tx.from_address,
    toAddress: tx.to_address,
    value: tx.value,
    gasPrice: tx.gas_price,
    gasLimit: tx.gas_limit,
    gasUsed: tx.gas_used,
    nonce: tx.nonce,
    status: tx.status,
    transactionType: tx.transaction_type,
    originalTypeHex: tx.original_type_hex,
    maxFeePerGas: tx.max_fee_per_gas,
    maxPriorityFeePerGas: tx.max_priority_fee_per_gas,
    effectiveGasPrice: tx.effective_gas_price,
    contractAddress: tx.contract_address,
    cumulativeGasUsed: tx.cumulative_gas_used,
    timestamp: tx.timestamp,
    events: tx.events?.map((event) => ({
      logIndex: event.log_index,
      address: event.address,
      topics: event.topics,
      data: event.data,
      transactionIndex: event.transaction_index,
      blockNumber: event.block_number,
    })),
  };
}

// Client fetch functions
export async function fetchStats(): Promise<Stats> {
  const response = await fetchFromApi<StatsResponse>("/stats");
  return {
    totalPairs: response.data.total_pairs,
    totalTokens: response.data.total_tokens,
    totalLiquidityUsd: response.data.total_liquidity_usd,
    totalVolumeUsd24h: response.data.total_volume_usd_24h,
    totalVolumeUsdAll: response.data.total_volume_usd_all,
    zilPriceUsd: response.data.zil_price_usd,
    zilPriceChange24h: response.data.zil_price_change_24h,
  };
}

export async function fetchPairs(
  page = 1,
  perPage = 50,
): Promise<PairListResponse> {
  const data = await fetchFromApi<ApiListResponse<PairResponse>>(
    `/pairs?page=${page}&per_page=${perPage}`,
  );

  const filteredPairs = data.data.filter((pair) => {
    const liquidity = Number.parseFloat(pair.liquidity_usd ?? "0");
    return !Number.isFinite(liquidity) || liquidity <= 1_000_000;
  });

  return {
    data: filteredPairs.map(mapPair),
    pagination: mapPagination(data.pagination),
  };
}

export async function fetchTokens(
  page = 1,
  perPage = 100,
): Promise<TokenListResponse> {
  const data = await fetchFromApi<ApiListResponse<TokenResponse>>(
    `/tokens?page=${page}&per_page=${perPage}`,
  );

  const tokens = data.data.map(mapToken);
  tokens.sort((a, b) => {
    const liqA = Number.parseFloat(a.liquidityUsd || "0");
    const liqB = Number.parseFloat(b.liquidityUsd || "0");
    return liqB - liqA;
  });

  return {
    data: tokens,
    pagination: mapPagination(data.pagination),
  };
}

export async function fetchBlocks(
  page = 1,
  perPage = 25,
): Promise<BlockListResponse> {
  const data = await fetchFromApi<ApiListResponse<BlockResponse>>(
    `/blocks?page=${page}&per_page=${perPage}`,
  );

  return {
    data: data.data.map(mapBlock),
    pagination: mapPagination(data.pagination),
  };
}

export async function fetchTransactions(
  page = 1,
  perPage = 25,
): Promise<TransactionListResponse> {
  const data = await fetchFromApi<ApiListResponse<TransactionResponse>>(
    `/transactions?page=${page}&per_page=${perPage}`,
  );

  return {
    data: data.data.map(mapTransaction),
    pagination: mapPagination(data.pagination),
  };
}

export async function fetchTokenByAddress(address: string): Promise<Token> {
  const response = await fetchFromApi<{ data: TokenResponse }>(
    `/tokens/${address}`,
  );
  return mapToken(response.data);
}

export async function fetchTokenPairs(
  address: string,
  page = 1,
  perPage = 25,
): Promise<PairListResponse> {
  const data = await fetchFromApi<ApiListResponse<PairResponse>>(
    `/tokens/${address}/pairs?page=${page}&per_page=${perPage}`,
  );

  return {
    data: data.data.map(mapPair),
    pagination: mapPagination(data.pagination),
  };
}

export async function fetchTokenChart(
  address: string,
): Promise<TokenChartData> {
  const response = await fetchFromApi<{ data: TokenChartData }>(
    `/tokens/${address}/chart/price`,
  );
  return response.data;
}

export async function fetchPairByAddress(pairAddress: string): Promise<Pair> {
  const response = await fetchFromApi<{ data: PairResponse }>(
    `/pairs/${pairAddress}`,
  );
  return mapPair(response.data);
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

export async function fetchPairChart(address: string): Promise<TokenChartData> {
  const response = await fetchFromApi<{ data: TokenChartData }>(
    `/pairs/${address}/chart/price`,
  );
  return response.data;
}

export async function fetchBlockByNumber(blockNumber: number): Promise<Block> {
  const response = await fetchFromApi<{ data: BlockResponse }>(
    `/blocks/${blockNumber}`,
  );
  return mapBlock(response.data);
}

export async function fetchTransactionByHash(
  hash: string,
): Promise<Transaction> {
  const response = await fetchFromApi<{ data: TransactionResponse }>(
    `/transactions/${hash}`,
  );
  return mapTransaction(response.data);
}

// Address-specific fetches (uses v2 API)
export async function fetchAddressTransactions(
  address: string,
  page = 1,
  perPage = 25,
): Promise<TransactionListResponse> {
  const data = await fetchFromApi<ApiListResponse<TransactionResponse>>(
    `/addresses/${address}/transactions?page=${page}&per_page=${perPage}`,
  );

  return {
    data: data.data.map(mapTransaction),
    pagination: mapPagination(data.pagination),
  };
}

interface AddressEventResponse {
  event_type: string;
  transaction_hash: string;
  log_index: number;
  block_number: number;
  timestamp: number;
  pair_address: string;
  token0_address: string;
  token0_symbol: string;
  token1_address: string;
  token1_symbol: string;
  amount0_in: string;
  amount1_in: string;
  amount0_out: string;
  amount1_out: string;
  amount_usd: string;
  maker: string;
}

export interface AddressEvent {
  eventType: string;
  transactionHash: string;
  logIndex: number;
  blockNumber: number;
  timestamp: number;
  pairAddress: string;
  token0Address: string;
  token0Symbol: string;
  token1Address: string;
  token1Symbol: string;
  amount0In: string;
  amount1In: string;
  amount0Out: string;
  amount1Out: string;
  amountUsd: string;
  maker: string;
}

export interface AddressEventsResponse {
  data: AddressEvent[];
  pagination: Pagination;
}

function mapAddressEvent(event: AddressEventResponse): AddressEvent {
  return {
    eventType: event.event_type,
    transactionHash: event.transaction_hash,
    logIndex: event.log_index,
    blockNumber: event.block_number,
    timestamp: event.timestamp,
    pairAddress: event.pair_address,
    token0Address: event.token0_address,
    token0Symbol: event.token0_symbol,
    token1Address: event.token1_address,
    token1Symbol: event.token1_symbol,
    amount0In: event.amount0_in,
    amount1In: event.amount1_in,
    amount0Out: event.amount0_out,
    amount1Out: event.amount1_out,
    amountUsd: event.amount_usd,
    maker: event.maker,
  };
}

export async function fetchAddressEvents(
  address: string,
  page = 1,
  perPage = 25,
): Promise<AddressEventsResponse> {
  const data = await fetchFromApi<ApiListResponse<AddressEventResponse>>(
    `/addresses/${address}/events?page=${page}&per_page=${perPage}`,
    API_V2_BASE_URL,
  );

  return {
    data: data.data.map(mapAddressEvent),
    pagination: mapPagination(data.pagination),
  };
}
