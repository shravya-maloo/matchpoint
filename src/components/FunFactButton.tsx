"use client";

import { useState } from "react";

export default function FunFactButton({
  player1,
  player2,
  tournament,
}: {
  player1?: string;
  player2?: string;
  tournament?: string;
}) {
  const [fact, setFact] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function reveal() {
    setOpen(true);
    if (fact) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (player1) params.set("player1", player1);
      if (player2) params.set("player2", player2);
      if (tournament) params.set("tournament", tournament);
      const res = await fetch(`/api/funfact?${params.toString()}`);
      const data = await res.json();
      setFact(data.fact ?? "No fun fact found.");
    } catch {
      setFact("Couldn't load a fun fact right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={(e) => {
          e.stopPropagation();
          reveal();
        }}
        className="text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1"
        style={{ background: "rgba(204,255,51,0.14)", color: "var(--accent)" }}
      >
        ⭐ Fun fact
      </button>

      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="card absolute z-30 top-full mt-2 right-0 w-64 p-3 text-xs text-[var(--text-soft)] shadow-xl"
        >
          <div className="flex justify-between items-start gap-2 mb-1">
            <span className="font-semibold text-[var(--accent)]">Fun fact</span>
            <button onClick={() => setOpen(false)} className="text-[var(--text-soft)]" aria-label="Close">
              ✕
            </button>
          </div>
          {loading ? "Loading…" : fact}
        </div>
      )}
    </div>
  );
}
