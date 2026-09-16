"use client";

import { useEffect, useState } from "react";
import type { Match } from "livetennisapi";
import { formatSets } from "@/lib/format";

export default function NewsTicker() {
  const [items, setItems] = useState<string[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/live");
        const data = await res.json();
        if (cancelled) return;
        const matches: Match[] = data.matches ?? [];
        if (matches.length === 0) {
          setItems(["No matches live right now — check the Upcoming tab for what's next."]);
          return;
        }
        setItems(
          matches.slice(0, 12).map((m) => {
            const p1 = m.players?.p1?.name ?? "?";
            const p2 = m.players?.p2?.name ?? "?";
            const sets = formatSets(m.score);
            return `🔴 LIVE — ${m.tournament ?? "Tour"}: ${p1} vs ${p2}${sets ? ` (${sets})` : ""}`;
          })
        );
      } catch {
        if (!cancelled) setItems(["Live updates are temporarily unavailable."]);
      }
    }
    load();
    const interval = setInterval(load, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (!items) return null;

  // Duplicate the content so the CSS scroll loop is seamless.
  const track = [...items, ...items];

  return (
    <div
      className="w-full overflow-hidden relative z-10"
      style={{ background: "var(--bg-elevated)", borderBottom: "1px solid var(--border)" }}
    >
      <div className="ticker-track py-2">
        {track.map((text, i) => (
          <span key={i} className="ticker-item text-xs font-medium text-[var(--text-soft)]">
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}
