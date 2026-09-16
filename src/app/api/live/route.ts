import { NextResponse } from "next/server";
import { getLiveMatches } from "@/lib/tennis";

export async function GET() {
  try {
    const matches = await getLiveMatches();
    return NextResponse.json({ matches });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load live matches" },
      { status: 502 }
    );
  }
}
