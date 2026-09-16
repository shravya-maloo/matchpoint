"use client";

import { useEffect, useState } from "react";
import type { RankingEntry } from "@/lib/espn";

export default function RankingsTab() {
  const [tour, setTour] = useState<"atp" | "wta">("atp");
  const [rankings, setRankings] = useState<RankingEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setRankings(null);
    setError(null);
    fetch(`/api/rankings?tour=${tour}`)
      .then((r) => r.json())
      .then((data) => (data.rankings ? setRankings(data.rankings) : setError(data.error ?? "Failed to load")))
      .catch(() => setError("Failed to load rankings"));
  }, [tour]);

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button className={`tab-btn ${tour === "atp" ? "active" : ""}`} onClick={() => setTour("atp")}>
          ATP
        </button>
        <button className={`tab-btn ${tour === "wta" ? "active" : ""}`} onClick={() => setTour("wta")}>
          WTA
        </button>
      </div>

      {error && <p className="text-[var(--text-soft)] text-sm">{error}</p>}
      {!error && rankings === null && <p className="text-[var(--text-soft)] text-sm">Loading rankings…</p>}

      {rankings && rankings.length > 0 && (
        <div className="card overflow-hidden">
          {rankings.map((r, i) => (
            <div
              key={`${r.rank}-${r.name}`}
              className="flex items-center gap-4 px-4 py-2.5 text-sm"
              style={{ borderBottom: i === rankings.length - 1 ? "none" : "1px solid var(--border)" }}
            >
              <span className="w-8 font-semibold text-[var(--accent)]">{r.rank}</span>
              <span className="flex-1 font-medium">{r.name}</span>
              <span className="text-[var(--text-soft)] text-xs w-10 text-right">{r.country ?? ""}</span>
              <span className="text-[var(--text-soft)] text-xs w-16 text-right">
                {r.points != null ? `${r.points} pts` : ""}
              </span>
            </div>
          ))}
        </div>
      )}

      {rankings && rankings.length === 0 && !error && (
        <p className="text-[var(--text-soft)] text-sm">No rankings data available.</p>
      )}
    </div>
  );
}
