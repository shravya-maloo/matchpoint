import { NextRequest, NextResponse } from "next/server";
import { answerChat } from "@/lib/chatbot";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const message = String(body?.message ?? "");
  const reply = await answerChat(message);
  return NextResponse.json({ reply });
}
