import { NextRequest, NextResponse } from "next/server";
import { getFunFact } from "@/lib/funfacts";

export async function GET(req: NextRequest) {
  const player1 = req.nextUrl.searchParams.get("player1") ?? undefined;
  const player2 = req.nextUrl.searchParams.get("player2") ?? undefined;
  const tournament = req.nextUrl.searchParams.get("tournament") ?? undefined;

  try {
    const fact = await getFunFact({ player1, player2, tournament });
    return NextResponse.json({ fact });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load fun fact" },
      { status: 502 }
    );
  }
}
