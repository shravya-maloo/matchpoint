import { NextResponse } from "next/server";
import { getUpcomingMatches } from "@/lib/tennis";

export async function GET() {
  try {
    const fixtures = await getUpcomingMatches();
    return NextResponse.json({ fixtures });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load upcoming matches" },
      { status: 502 }
    );
  }
}
