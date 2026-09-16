"use client";

import { useState } from "react";
import type { Player } from "livetennisapi";

export default function PlayersTab() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Player[] | null>(null);
  const [selected, setSelected] = useState<Player | null>(null);
  const [loading, setLoading] = useState(false);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSelected(null);
    try {
      const res = await fetch(`/api/players/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.players ?? []);
    } finally {
      setLoading(false);
    }
  }

  async function openPlayer(p: Player) {
    if (!p.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/players/${p.id}`);
      const data = await res.json();
      setSelected(data.player ?? p);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={search} className="flex gap-2 mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a player (e.g. Alcaraz)"
          className="flex-1 text-sm rounded-lg px-3 py-2 outline-none"
          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text)" }}
        />
        <button
          type="submit"
          className="text-sm font-semibold px-4 py-2 rounded-lg"
          style={{ background: "var(--accent)", color: "#0a1420" }}
        >
          Search
        </button>
      </form>

      {loading && <p className="text-[var(--text-soft)] text-sm">Loading…</p>}

      {selected && (
        <div className="card p-5 mb-4">
          <h3 className="text-xl mb-1">{selected.name}</h3>
          <p className="text-sm text-[var(--text-soft)] mb-3">
            {selected.country ?? "Unknown country"} · {(selected.tour ?? "").toUpperCase()}
          </p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Stat label="Ranking" value={selected.ranking ? `#${selected.ranking}` : "Unranked"} />
            <Stat label="Ranking points" value={selected.ranking_points ?? "—"} />
            <Stat label="Plays" value={selected.hand === "L" ? "Left-handed" : selected.hand === "R" ? "Right-handed" : "—"} />
            <Stat label="Backhand" value={selected.backhand === 1 ? "One-handed" : selected.backhand === 2 ? "Two-handed" : "—"} />
          </div>
        </div>
      )}

      {results && results.length === 0 && !loading && (
        <p className="text-[var(--text-soft)] text-sm">No players found.</p>
      )}

      {results && results.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2">
          {results.map((p) => (
            <button
              key={p.id}
              onClick={() => openPlayer(p)}
              className="card card-hover p-3 text-left"
            >
              <p className="font-medium text-sm">{p.name}</p>
              <p className="text-xs text-[var(--text-soft)]">
                {p.country ?? "—"} {p.ranking ? `· #${p.ranking}` : ""}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-xs text-[var(--text-soft)] uppercase tracking-wide">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
