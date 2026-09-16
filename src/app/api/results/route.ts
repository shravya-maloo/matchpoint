import { NextRequest, NextResponse } from "next/server";
import { getRecentResults } from "@/lib/espn";

export async function GET(req: NextRequest) {
  const daysBack = Number(req.nextUrl.searchParams.get("days") ?? "4");
  try {
    const results = await getRecentResults(Number.isFinite(daysBack) ? daysBack : 4);
    return NextResponse.json({ results });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load results" },
      { status: 502 }
    );
  }
}
