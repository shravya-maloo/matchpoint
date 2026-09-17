import { NextRequest, NextResponse } from "next/server";
import { getFormForPlayers } from "@/lib/form";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const names = Array.isArray(body?.names) ? body.names.filter((n: unknown) => typeof n === "string") : [];
  try {
    const form = await getFormForPlayers(names);
    return NextResponse.json({ form });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to load form" }, { status: 502 });
  }
}
