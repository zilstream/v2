import { type NextRequest, NextResponse } from "next/server";

const API_URL = "https://v2-api.zilstream.com";

interface ApiEvent {
  protocol: string;
  event_type: string;
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
  amount_usd: string;
  token0_address?: string;
  token1_address?: string;
  token0_symbol?: string;
  token1_symbol?: string;
  token0_decimals?: number;
  token1_decimals?: number;
}

function mapEvent(event: ApiEvent) {
  return {
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
    amountUsd: event.amount_usd,
    token0: event.token0_address,
    token1: event.token1_address,
    token0Symbol: event.token0_symbol,
    token1Symbol: event.token1_symbol,
    token0Decimals: event.token0_decimals,
    token1Decimals: event.token1_decimals,
    protocol: event.protocol,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> },
) {
  const { address } = await params;
  const searchParams = request.nextUrl.searchParams;
  const page = Number.parseInt(searchParams.get("page") || "1", 10);
  const perPage = Number.parseInt(searchParams.get("per_page") || "10", 10);

  try {
    const url = new URL(`${API_URL}/addresses/${address}/events`);
    url.searchParams.set("page", page.toString());
    url.searchParams.set("per_page", perPage.toString());

    const response = await fetch(url.toString());

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch address events" },
        { status: response.status },
      );
    }

    const result = await response.json();
    
    const mappedResult = {
      data: result.data?.map(mapEvent) || [],
      pagination: result.pagination,
    };
    
    return NextResponse.json(mappedResult);
  } catch (error) {
    console.error("Failed to fetch address events:", error);
    return NextResponse.json(
      { error: "Failed to fetch address events" },
      { status: 500 },
    );
  }
}
