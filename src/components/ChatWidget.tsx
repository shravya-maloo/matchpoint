"use client";

import { useState, useRef, useEffect } from "react";

type ChatMessage = { role: "user" | "bot"; text: string };

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "bot", text: "Hey! Ask me who's live right now, a player, or tennis terms like \"deuce\"." },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);
    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "bot", text: data.reply ?? "Sorry, something went wrong." }]);
    } catch {
      setMessages((m) => [...m, { role: "bot", text: "Sorry, something went wrong." }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      {open && (
        <div className="card w-80 max-w-[90vw] h-96 flex flex-col overflow-hidden shadow-2xl">
          <div
            className="px-4 py-3 flex items-center justify-between"
            style={{ background: "var(--bg-elevated-2)", borderBottom: "1px solid var(--border)" }}
          >
            <span className="headline text-sm">MatchPoint Assistant</span>
            <button onClick={() => setOpen(false)} className="text-[var(--text-soft)] hover:text-[var(--text)]" aria-label="Close chat">
              ✕
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2">
            {messages.map((m, i) => (
              <div
                key={i}
                className="text-sm rounded-lg px-3 py-2 whitespace-pre-line max-w-[85%]"
                style={{
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  background: m.role === "user" ? "var(--accent)" : "var(--bg-elevated-2)",
                  color: m.role === "user" ? "#0a1420" : "var(--text)",
                }}
              >
                {m.text}
              </div>
            ))}
            {sending && (
              <div className="text-sm rounded-lg px-3 py-2 self-start" style={{ background: "var(--bg-elevated-2)", color: "var(--text-soft)" }}>
                …
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="p-2 flex gap-2"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about scores, players…"
              className="flex-1 text-sm rounded-lg px-3 py-2 outline-none"
              style={{ background: "var(--bg-elevated-2)", color: "var(--text)", border: "1px solid var(--border)" }}
            />
            <button
              type="submit"
              disabled={sending}
              className="text-sm font-semibold px-3 py-2 rounded-lg disabled:opacity-50"
              style={{ background: "var(--accent)", color: "#0a1420" }}
            >
              Send
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="w-14 h-14 rounded-full grid place-items-center shadow-xl text-2xl"
        style={{ background: "var(--accent)", color: "#0a1420" }}
        aria-label="Open chat"
      >
        {open ? "✕" : "💬"}
      </button>
    </div>
  );
}
