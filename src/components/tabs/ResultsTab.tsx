"use client";

import { useEffect, useState } from "react";
import type { ResultMatch } from "@/lib/espn";
import FunFactButton from "@/components/FunFactButton";
import { isMarqueeMatch } from "@/lib/marquee";
import MatchDetailModal, { type DetailData } from "@/components/MatchDetailModal";

export default function ResultsTab() {
  const [results, setResults] = useState<ResultMatch[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<DetailData | null>(null);

  useEffect(() => {
    fetch("/api/results?days=5")
      .then((r) => r.json())
      .then((data) => (data.results ? setResults(data.results) : setError(data.error ?? "Failed to load")))
      .catch(() => setError("Failed to load results"));
  }, []);

  if (error) return <p className="text-[var(--text-soft)] text-sm">{error}</p>;
  if (results === null) return <p className="text-[var(--text-soft)] text-sm">Loading recent results…</p>;
  if (results.length === 0) return <p className="text-[var(--text-soft)] text-sm">No completed matches in the last few days.</p>;

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        {results.map((r) => {
          const marquee = isMarqueeMatch({ tournament: r.tournament });
          return (
            <div
              key={r.id}
              className="card card-hover p-4 cursor-pointer"
              onClick={() =>
                setSelected({
                  tour: r.tour,
                  tournament: r.tournament,
                  round: r.round,
                  status: "completed",
                  player1: { name: r.player1.name, country: r.player1.country },
                  player2: { name: r.player2.name, country: r.player2.country },
                  perSet1: r.player1.sets,
                  perSet2: r.player2.sets,
                  winner: r.player1.winner ? 1 : r.player2.winner ? 2 : null,
                  summary: r.summary,
                })
              }
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`tour-badge ${r.tour}`}>{r.tour.toUpperCase()}</span>
                  <span className="text-xs text-[var(--text-soft)]">{r.round}</span>
                </div>
                {marquee && <FunFactButton player1={r.player1.name} player2={r.player2.name} tournament={r.tournament} />}
              </div>
              <p className="text-sm text-[var(--text-soft)] mb-2">{r.tournament}</p>
              <ResultRow name={r.player1.name} winner={r.player1.winner} sets={r.player1.sets} />
              <ResultRow name={r.player2.name} winner={r.player2.winner} sets={r.player2.sets} />
              {r.summary && <p className="text-xs text-[var(--text-soft)] mt-2">{r.summary}</p>}
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                  `${r.player1.name} vs ${r.player2.name} ${r.tournament} highlights`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-xs font-semibold mt-2 inline-block"
                style={{ color: "var(--accent)" }}
              >
                ▶ Watch highlights
              </a>
            </div>
          );
        })}
      </div>

      {selected && <MatchDetailModal data={selected} onClose={() => setSelected(null)} />}
    </>
  );
}

function ResultRow({ name, winner, sets }: { name: string; winner: boolean; sets: number[] }) {
  return (
    <div className="flex items-center justify-between text-sm py-0.5">
      <span className={winner ? "font-semibold" : "text-[var(--text-soft)]"}>{name}</span>
      <span className={`flex gap-2 ${winner ? "font-semibold" : "text-[var(--text-soft)]"}`}>
        {sets.map((s, i) => (
          <span key={i} className="w-4 text-center">
            {s}
          </span>
        ))}
      </span>
    </div>
  );
}
