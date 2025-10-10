import { NextRequest, NextResponse } from "next/server";
import { fetchPairs } from "@/lib/zilstream";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = Number.parseInt(searchParams.get("page") || "1", 10);
  const perPage = Number.parseInt(searchParams.get("per_page") || "50", 10);

  try {
    const result = await fetchPairs(page, perPage);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch pairs:", error);
    return NextResponse.json(
      { error: "Failed to fetch pairs" },
      { status: 500 },
    );
  }
}
