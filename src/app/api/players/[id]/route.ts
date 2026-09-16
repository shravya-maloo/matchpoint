import { NextResponse } from "next/server";
import { getPlayer } from "@/lib/tennis";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const playerId = Number(id);
  if (!Number.isInteger(playerId)) {
    return NextResponse.json({ error: "Invalid player id" }, { status: 400 });
  }
  try {
    const player = await getPlayer(playerId);
    if (!player) return NextResponse.json({ error: "Player not found" }, { status: 404 });
    return NextResponse.json({ player });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load player" },
      { status: 502 }
    );
  }
}
