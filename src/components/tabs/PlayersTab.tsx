"use client";

import { useEffect, useState } from "react";
import type { Player } from "livetennisapi";
import FormIndicator from "@/components/FormIndicator";
import type { FormResult } from "@/lib/form";

function prettifyKey(key: string): string {
  const spaced = key.replace(/_/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/** Renders whatever primitive fields exist on an unknown-shaped stats object. */
function StatsBlock({ title, data }: { title: string; data: unknown }) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  const entries = Object.entries(data as Record<string, unknown>).filter(
    ([, v]) => typeof v === "string" || typeof v === "number" || typeof v === "boolean"
  );
  if (entries.length === 0) return null;
  return (
    <div className="mt-3">
      <p className="text-xs text-[var(--text-soft)] uppercase tracking-wide mb-1.5">{title}</p>
      <div className="grid grid-cols-2 gap-2 text-sm">
        {entries.map(([k, v]) => (
          <Stat key={k} label={prettifyKey(k)} value={String(v)} />
        ))}
      </div>
    </div>
  );
}

function ageFromBirthday(birthday?: string | null): number | null {
  if (!birthday) return null;
  const d = new Date(birthday);
  if (isNaN(d.getTime())) return null;
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
}

function movementDisplay(movement?: "up" | "down" | "same" | null): { symbol: string; color: string; label: string } | null {
  if (!movement) return null;
  if (movement === "up") return { symbol: "▲", color: "var(--accent)", label: "Moving up" };
  if (movement === "down") return { symbol: "▼", color: "var(--live)", label: "Moving down" };
  return { symbol: "–", color: "var(--text-soft)", label: "Unchanged" };
}

export default function PlayersTab({
  initialQuery,
  onConsumedInitialQuery,
}: {
  initialQuery?: string | null;
  onConsumedInitialQuery?: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Player[] | null>(null);
  const [selected, setSelected] = useState<Player | null>(null);
  const [form, setForm] = useState<FormResult[] | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  async function runSearch(q: string) {
    if (!q.trim()) return;
    setLoading(true);
    setSelected(null);
    try {
      const res = await fetch(`/api/players/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.players ?? []);
      return data.players as Player[] | undefined;
    } finally {
      setLoading(false);
    }
  }

  async function openPlayer(p: Player) {
    setForm(undefined);
    if (!p.id) {
      setSelected(p);
    } else {
      setLoading(true);
      try {
        const res = await fetch(`/api/players/${p.id}`);
        const data = await res.json();
        setSelected(data.player ?? p);
      } finally {
        setLoading(false);
      }
    }
    if (p.name) {
      const playerName = p.name;
      fetch("/api/players/form-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ names: [playerName] }),
      })
        .then((r) => r.json())
        .then((d) => setForm(d.form?.[playerName]))
        .catch(() => {});
    }
  }

  useEffect(() => {
    if (!initialQuery) return;
    setQuery(initialQuery);
    (async () => {
      const players = await runSearch(initialQuery);
      if (players && players.length > 0) await openPlayer(players[0]);
      onConsumedInitialQuery?.();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    await runSearch(query);
  }

  const age = ageFromBirthday(selected?.birthday);
  const movement = movementDisplay(selected?.ranking_movement);

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
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl mb-1">{selected.name}</h3>
              <p className="text-sm text-[var(--text-soft)] mb-3">
                {selected.country ?? "Unknown country"} · {(selected.tour ?? "").toUpperCase()}
                {age != null && ` · Age ${age}`}
                {selected.is_doubles_team && " · Doubles team"}
              </p>
              {form && form.length > 0 && (
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="text-xs text-[var(--text-soft)] uppercase tracking-wide">Form</span>
                  <FormIndicator form={form} size="md" />
                </div>
              )}
            </div>
            {movement && (
              <span className="text-sm font-semibold flex items-center gap-1" style={{ color: movement.color }} title={movement.label}>
                {movement.symbol}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <Stat label="Ranking" value={selected.ranking ? `#${selected.ranking}` : "Unranked"} />
            <Stat label="Ranking points" value={selected.ranking_points ?? "-"} />
            <Stat label="Plays" value={selected.hand === "L" ? "Left-handed" : selected.hand === "R" ? "Right-handed" : "-"} />
            <Stat label="Backhand" value={selected.backhand === 1 ? "One-handed" : selected.backhand === 2 ? "Two-handed" : "-"} />
            <Stat label="Birthday" value={selected.birthday ? new Date(selected.birthday).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : "-"} />
          </div>

          <StatsBlock title="Ratings" data={selected.stats?.ratings} />
          <StatsBlock title="Season stats" data={selected.stats?.season} />
        </div>
      )}

      {results && results.length === 0 && !loading && (
        <p className="text-[var(--text-soft)] text-sm">No players found.</p>
      )}

      {results && results.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2">
          {results.map((p) => (
            <button key={p.id} onClick={() => openPlayer(p)} className="card card-hover p-3 text-left">
              <p className="font-medium text-sm">{p.name}</p>
              <p className="text-xs text-[var(--text-soft)]">
                {p.country ?? "-"} {p.ranking ? `· #${p.ranking}` : ""}
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
