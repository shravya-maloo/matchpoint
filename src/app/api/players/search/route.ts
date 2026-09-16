import { NextRequest, NextResponse } from "next/server";
import { searchPlayers } from "@/lib/tennis";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  try {
    const players = await searchPlayers(q);
    return NextResponse.json({ players });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Search failed" },
      { status: 502 }
    );
  }
}
