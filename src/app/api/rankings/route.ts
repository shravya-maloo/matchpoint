import { NextRequest, NextResponse } from "next/server";
import { getRankings } from "@/lib/espn";

export async function GET(req: NextRequest) {
  const tour = req.nextUrl.searchParams.get("tour") === "wta" ? "wta" : "atp";
  try {
    const rankings = await getRankings(tour, 100);
    return NextResponse.json({ tour, rankings });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load rankings" },
      { status: 502 }
    );
  }
}
