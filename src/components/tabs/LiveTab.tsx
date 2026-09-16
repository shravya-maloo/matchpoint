"use client";

import { useEffect, useState } from "react";
import type { Match } from "livetennisapi";
import { formatSets, formatCurrentGame, setsPerPlayer } from "@/lib/format";
import { isMarqueeMatch } from "@/lib/marquee";
import FunFactButton from "@/components/FunFactButton";
import MatchDetailModal, { type DetailData } from "@/components/MatchDetailModal";

export default function LiveTab() {
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<DetailData | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/live");
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) setError(data.error ?? "Failed to load");
        else setMatches(data.matches);
      } catch {
        if (!cancelled) setError("Failed to load live matches");
      }
    }
    load();
    const interval = setInterval(load, 25000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (error) return <p className="text-[var(--text-soft)] text-sm">{error}</p>;
  if (matches === null) return <p className="text-[var(--text-soft)] text-sm">Loading live matches…</p>;
  if (matches.length === 0) return <p className="text-[var(--text-soft)] text-sm">No matches live right now.</p>;

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        {matches.map((m) => {
          const p1 = m.players?.p1;
          const p2 = m.players?.p2;
          const marquee = isMarqueeMatch({ ranking1: p1?.ranking, ranking2: p2?.ranking, tournament: m.tournament });
          const highlightsUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
            `${p1?.name ?? ""} vs ${p2?.name ?? ""} ${m.tournament ?? ""} highlights`
          )}`;

          return (
            <div
              key={m.id}
              className="card card-hover p-4 cursor-pointer"
              onClick={() => {
                const [perSet1, perSet2] = setsPerPlayer(m.score);
                setSelected({
                  tour: m.tour ?? "atp",
                  tournament: m.tournament ?? "Tournament",
                  round: m.round ?? undefined,
                  status: "live",
                  player1: { name: p1?.name ?? "TBD", country: p1?.country, ranking: p1?.ranking },
                  player2: { name: p2?.name ?? "TBD", country: p2?.country, ranking: p2?.ranking },
                  perSet1,
                  perSet2,
                  currentGame: formatCurrentGame(m.score),
                  winner: m.winner ?? null,
                });
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="live-dot" />
                  <span className={`tour-badge ${m.tour ?? "atp"}`}>{(m.tour ?? "").toUpperCase()}</span>
                  <span className="text-xs text-[var(--text-soft)]">{m.round}</span>
                </div>
                {marquee && (
                  <FunFactButton player1={p1?.name} player2={p2?.name} tournament={m.tournament ?? undefined} />
                )}
              </div>

              <p className="text-sm text-[var(--text-soft)] mb-2">{m.tournament}</p>

              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <PlayerRow name={p1?.name} serving={m.score?.server === 1} />
                  <PlayerRow name={p2?.name} serving={m.score?.server === 2} />
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatSets(m.score)}</p>
                  {formatCurrentGame(m.score) && (
                    <p className="text-xs text-[var(--accent)]">{formatCurrentGame(m.score)}</p>
                  )}
                </div>
              </div>

              <a
                href={highlightsUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-xs font-semibold mt-3 inline-block"
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

function PlayerRow({ name, serving }: { name?: string; serving?: boolean }) {
  return (
    <span className="text-sm font-medium flex items-center gap-1.5">
      {serving && <span style={{ color: "var(--accent)" }}>●</span>}
      {name ?? "TBD"}
    </span>
  );
}
