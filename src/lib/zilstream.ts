const API_BASE_URL = "https://api-v2.zilstream.com";

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

export interface Token {
  address: string;
  symbol?: string;
  name?: string;
  decimals?: number;
  totalSupply?: string;
  priceUsd?: string;
  priceEth?: string;
  marketCapUsd?: string;
  liquidityUsd?: string;
  volume24hUsd?: string;
  totalVolumeUsd?: string;
  priceChange24h?: string;
  priceChange7d?: string;
  firstSeenBlock?: number;
  firstSeenTimestamp?: number;
}

export interface PairResponse {
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
  fee?: string;
  reserve0: string;
  reserve1: string;
  liquidityUsd: string;
  volumeUsd: string;
  volumeUsd24h: string;
  txnCount: number;
  priceChange24h?: string;
  priceChange7d?: string;
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

interface StatsResponse {
  data: {
    total_pairs: number;
    total_tokens: number;
    total_liquidity_usd: string;
    total_volume_usd_24h: string;
    total_volume_usd_all: string;
  };
}

export interface Stats {
  totalPairs: number;
  totalTokens: number;
  totalLiquidityUsd: string;
  totalVolumeUsd24h: string;
  totalVolumeUsdAll: string;
}

async function fetchFromApi<TResponse>(path: string): Promise<TResponse> {
  const maxRetries = 3;
  const baseDelay = 500;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(`${API_BASE_URL}${path}`, {
        headers: {
          accept: "application/json",
        },
        // Refresh data roughly once a minute while keeping ISR benefits.
        next: { revalidate: 60 },
      });

      if (!res.ok) {
        // Don't retry 4xx errors
        if (res.status >= 400 && res.status < 500) {
          throw new Error(`ZilStream API request failed with status ${res.status}`);
        }
        // Throw for 5xx errors so they can be retried
        throw new Error(`Server error: ${res.status}`);
      }

      return res.json() as Promise<TResponse>;
    } catch (error) {
      // If we've exhausted retries, or it's a 4xx error (which we re-threw above), throw it
      if (
        i === maxRetries - 1 ||
        (error instanceof Error && error.message.includes("status 4"))
      ) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      await new Promise((resolve) =>
        setTimeout(resolve, baseDelay * Math.pow(2, i))
      );
    }
  }

  throw new Error("ZilStream API request failed after retries");
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

export function mapPair(pair: PairResponse): Pair {
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

export async function fetchPairByAddress(pairAddress: string): Promise<Pair> {
  const response = await fetchFromApi<{ data: PairResponse }>(
    `/pairs/${pairAddress}`,
  );
  return mapPair(response.data);
}

export async function fetchStats(): Promise<Stats> {
  const response = await fetchFromApi<StatsResponse>("/stats");

  return {
    totalPairs: response.data.total_pairs,
    totalTokens: response.data.total_tokens,
    totalLiquidityUsd: response.data.total_liquidity_usd,
    totalVolumeUsd24h: response.data.total_volume_usd_24h,
    totalVolumeUsdAll: response.data.total_volume_usd_all,
  };
}

export async function fetchTokenByAddress(address: string): Promise<Token> {
  const response = await fetchFromApi<{ data: TokenResponse }>(
    `/tokens/${address}`,
  );
  return mapToken(response.data);
}

export interface TokenChartData {
  address: string;
  protocol: string;
  base_token: {
    address: string;
    symbol: string;
    decimals: number;
  };
  quote: string;
  timeframe: string;
  interval: string;
  points: {
    timestamp: string;
    price: string;
    source: string;
    price_change_24h?: string;
    price_change_7d?: string;
  }[];
}

export async function fetchTokenChart(
  address: string,
): Promise<TokenChartData> {
  const response = await fetchFromApi<{ data: TokenChartData }>(
    `/tokens/${address}/chart/price`,
  );
  return response.data;
}

export async function fetchPairChart(address: string): Promise<TokenChartData> {
  const response = await fetchFromApi<{ data: TokenChartData }>(
    `/pairs/${address}/chart/price`,
  );
  return response.data;
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

export interface Block {
  number: number;
  hash: string;
  parentHash: string;
  timestamp: number;
  gasLimit: number;
  gasUsed: number;
  baseFeePerGas: string;
  transactionCount: number;
  transactions?: Transaction[];
}

interface TransactionEventResponse {
  log_index: number;
  address: string;
  topics: string[];
  data: string;
  transaction_index: number;
  block_number: number;
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

export interface TransactionEvent {
  logIndex: number;
  address: string;
  topics: string[];
  data: string;
  transactionIndex: number;
  blockNumber: number;
}

export interface Transaction {
  hash: string;
  blockNumber: number;
  transactionIndex: number;
  fromAddress: string;
  toAddress: string | null;
  value: string;
  gasPrice: string;
  gasLimit: number;
  gasUsed: number;
  nonce: number;
  status: number;
  transactionType: number;
  originalTypeHex: string | null;
  maxFeePerGas: string | null;
  maxPriorityFeePerGas: string | null;
  effectiveGasPrice: string;
  contractAddress: string | null;
  cumulativeGasUsed: number;
  timestamp: number;
  events?: TransactionEvent[];
}

export interface BlockListResponse {
  data: Block[];
  pagination: Pagination;
}

export interface TransactionListResponse {
  data: Transaction[];
  pagination: Pagination;
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

export async function fetchBlockByNumber(blockNumber: number): Promise<Block> {
  const response = await fetchFromApi<{ data: BlockResponse }>(
    `/blocks/${blockNumber}`,
  );
  return mapBlock(response.data);
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

export async function fetchTransactionByHash(
  hash: string,
): Promise<Transaction> {
  const response = await fetchFromApi<{ data: TransactionResponse }>(
    `/transactions/${hash}`,
  );
  return mapTransaction(response.data);
}

export { API_BASE_URL };
