import { NextRequest, NextResponse } from "next/server";
import { getHeadToHead } from "@/lib/headtohead";

export async function GET(req: NextRequest) {
  const p1 = req.nextUrl.searchParams.get("p1") ?? "";
  const p2 = req.nextUrl.searchParams.get("p2") ?? "";
  if (!p1 || !p2) {
    return NextResponse.json({ error: "Both p1 and p2 are required" }, { status: 400 });
  }
  try {
    const record = await getHeadToHead(p1, p2);
    return NextResponse.json(record);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to load head-to-head" }, { status: 502 });
  }
}
