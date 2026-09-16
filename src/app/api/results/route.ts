import { NextRequest, NextResponse } from "next/server";
import { getRecentResults, getResultsInRange } from "@/lib/espn";

export async function GET(req: NextRequest) {
  const from = req.nextUrl.searchParams.get("from");
  const to = req.nextUrl.searchParams.get("to");

  try {
    const results =
      from && to
        ? await getResultsInRange(from, to)
        : await getRecentResults(Number(req.nextUrl.searchParams.get("days") ?? "4") || 4);
    return NextResponse.json({ results });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load results" },
      { status: 502 }
    );
  }
}
