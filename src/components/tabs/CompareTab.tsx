"use client";

import { useState } from "react";
import type { Player } from "livetennisapi";
import type { H2HRecord } from "@/lib/headtohead";
import { formatDate } from "@/lib/dates";
import PlayerAvatar from "@/components/PlayerAvatar";

function PlayerPicker({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: Player | null;
  onSelect: (p: Player) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Player[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/players/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.players ?? []);
    } finally {
      setLoading(false);
    }
  }

  if (selected) {
    return (
      <div className="card p-4 flex flex-col items-center gap-2">
        <PlayerAvatar name={selected.name} size={56} />
        <p className="font-semibold text-sm">{selected.name}</p>
        <p className="text-xs text-[var(--text-soft)]">
          {selected.country ?? "—"} {selected.ranking ? `· #${selected.ranking}` : ""}
        </p>
        <button onClick={() => onSelect(null as unknown as Player)} className="text-xs text-[var(--text-soft)] hover:underline">
          Change
        </button>
      </div>
    );
  }

  return (
    <div className="card p-4">
      <p className="text-xs text-[var(--text-soft)] uppercase tracking-wide mb-2">{label}</p>
      <form onSubmit={search} className="flex gap-2 mb-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a player…"
          className="flex-1 text-sm rounded-lg px-2.5 py-1.5 outline-none"
          style={{ background: "var(--bg-elevated-2)", border: "1px solid var(--border)", color: "var(--text)" }}
        />
        <button type="submit" className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: "var(--accent)", color: "#0a1420" }}>
          Go
        </button>
      </form>
      {loading && <p className="text-xs text-[var(--text-soft)]">Searching…</p>}
      {results && results.length === 0 && !loading && <p className="text-xs text-[var(--text-soft)]">No players found.</p>}
      {results && results.length > 0 && (
        <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
          {results.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelect(p)}
              className="text-left text-sm px-2 py-1.5 rounded-lg hover:bg-[var(--bg-elevated-2)]"
            >
              {p.name} <span className="text-xs text-[var(--text-soft)]">{p.country ?? ""}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CompareStat({ label, v1, v2, higherIsBetter }: { label: string; v1: string | number | null; v2: string | number | null; higherIsBetter?: boolean }) {
  const n1 = typeof v1 === "number" ? v1 : null;
  const n2 = typeof v2 === "number" ? v2 : null;
  let winner: 1 | 2 | null = null;
  if (n1 != null && n2 != null && n1 !== n2 && higherIsBetter !== undefined) {
    const p1Better = higherIsBetter ? n1 > n2 : n1 < n2;
    winner = p1Better ? 1 : 2;
  }
  return (
    <div className="grid grid-cols-3 items-center py-2 text-sm" style={{ borderBottom: "1px solid var(--border)" }}>
      <span className={`text-center ${winner === 1 ? "font-bold" : ""}`} style={{ color: winner === 1 ? "var(--accent)" : undefined }}>
        {v1 ?? "—"}
      </span>
      <span className="text-center text-xs text-[var(--text-soft)] uppercase tracking-wide">{label}</span>
      <span className={`text-center ${winner === 2 ? "font-bold" : ""}`} style={{ color: winner === 2 ? "var(--accent)" : undefined }}>
        {v2 ?? "—"}
      </span>
    </div>
  );
}

export default function CompareTab() {
  const [p1, setP1] = useState<Player | null>(null);
  const [p2, setP2] = useState<Player | null>(null);
  const [h2h, setH2h] = useState<H2HRecord | null>(null);
  const [loadingH2h, setLoadingH2h] = useState(false);

  async function selectPlayer(which: 1 | 2, p: Player | null) {
    setH2h(null);
    if (which === 1) setP1(p);
    else setP2(p);

    const other = which === 1 ? p2 : p1;
    if (p && other && p.name && other.name) {
      setLoadingH2h(true);
      try {
        const res = await fetch(`/api/head-to-head?p1=${encodeURIComponent(p.name)}&p2=${encodeURIComponent(other.name)}`);
        const data = await res.json();
        if (res.ok) setH2h(data);
      } finally {
        setLoadingH2h(false);
      }
    }
  }

  return (
    <div>
      <div className="grid sm:grid-cols-2 gap-3 mb-6">
        <PlayerPicker label="Player 1" selected={p1} onSelect={(p) => selectPlayer(1, p)} />
        <PlayerPicker label="Player 2" selected={p2} onSelect={(p) => selectPlayer(2, p)} />
      </div>

      {p1 && p2 && (
        <div className="card p-5 mb-4">
          <div className="grid grid-cols-3 items-center pb-3 mb-1" style={{ borderBottom: "2px solid var(--border)" }}>
            <p className="text-center font-bold">{p1.name}</p>
            <p className="text-center text-xs text-[var(--text-soft)]">VS</p>
            <p className="text-center font-bold">{p2.name}</p>
          </div>
          <CompareStat label="Ranking" v1={p1.ranking ? `#${p1.ranking}` : null} v2={p2.ranking ? `#${p2.ranking}` : null} />
          <CompareStat label="Ranking pts" v1={p1.ranking_points ?? null} v2={p2.ranking_points ?? null} higherIsBetter />
          <CompareStat label="Country" v1={p1.country ?? null} v2={p2.country ?? null} />
          <CompareStat label="Plays" v1={p1.hand === "L" ? "Left" : p1.hand === "R" ? "Right" : null} v2={p2.hand === "L" ? "Left" : p2.hand === "R" ? "Right" : null} />
          <CompareStat
            label="Backhand"
            v1={p1.backhand === 1 ? "1-handed" : p1.backhand === 2 ? "2-handed" : null}
            v2={p2.backhand === 1 ? "1-handed" : p2.backhand === 2 ? "2-handed" : null}
          />
        </div>
      )}

      {p1 && p2 && (
        <div className="card p-5">
          <p className="text-xs text-[var(--text-soft)] uppercase tracking-wide mb-3">
            Recent head-to-head (last ~3 months of results — not a full career record)
          </p>
          {loadingH2h && <p className="text-sm text-[var(--text-soft)]">Loading…</p>}
          {!loadingH2h && h2h && h2h.matches.length === 0 && (
            <p className="text-sm text-[var(--text-soft)]">No matches between them in the last 90 days.</p>
          )}
          {!loadingH2h && h2h && h2h.matches.length > 0 && (
            <>
              <p className="text-center text-2xl font-bold mb-3">
                {h2h.player1Wins} — {h2h.player2Wins}
              </p>
              <div className="flex flex-col gap-2">
                {h2h.matches.map((m) => (
                  <div key={m.id} className="text-sm px-3 py-2 rounded-lg" style={{ background: "var(--bg-elevated-2)" }}>
                    <div className="flex justify-between text-xs text-[var(--text-soft)] mb-1">
                      <span>{m.tournament} · {m.round}</span>
                      <span>{formatDate(m.date)}</span>
                    </div>
                    <p>
                      <span className={m.player1.winner ? "font-semibold" : "text-[var(--text-soft)]"}>{m.player1.name}</span> def.{" "}
                      <span className={m.player2.winner ? "font-semibold" : "text-[var(--text-soft)]"}>{m.player2.name}</span>{" "}
                      {m.player1.sets.map((s, i) => `${s}-${m.player2.sets[i] ?? 0}`).join(", ")}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
