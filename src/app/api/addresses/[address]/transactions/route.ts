import { NextRequest, NextResponse } from "next/server";

const API_URL = "https://v2-api.zilstream.com";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;
  const searchParams = request.nextUrl.searchParams;
  const page = Number.parseInt(searchParams.get("page") || "1", 10);
  const perPage = Number.parseInt(searchParams.get("per_page") || "25", 10);

  try {
    const url = new URL(`${API_URL}/addresses/${address}/transactions`);
    url.searchParams.set("page", page.toString());
    url.searchParams.set("per_page", perPage.toString());

    const response = await fetch(url.toString());

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch address transactions" },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch address transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch address transactions" },
      { status: 500 }
    );
  }
}
