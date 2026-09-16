"use client";

import { useEffect, useMemo, useState } from "react";
import type { Match } from "livetennisapi";
import { formatSets, formatCurrentGame, setsPerPlayer } from "@/lib/format";
import { formatDate, elapsedSince, elapsedMinutes } from "@/lib/dates";
import { genericWatchSearchUrl } from "@/lib/watch";
import { tournamentCategory, type TournamentCategory } from "@/lib/tournamentCategory";
import { isMarqueeMatch } from "@/lib/marquee";
import FunFactButton from "@/components/FunFactButton";
import MatchDetailModal, { type DetailData } from "@/components/MatchDetailModal";
import MatchFilters from "@/components/MatchFilters";

export default function LiveTab() {
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<DetailData | null>(null);

  const [category, setCategory] = useState<TournamentCategory | "all">("all");
  const [tournament, setTournament] = useState("all");
  const [playerQuery, setPlayerQuery] = useState("");
  const [sortField, setSortField] = useState("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

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

  const tournaments = useMemo(
    () => Array.from(new Set((matches ?? []).map((m) => m.tournament).filter((t): t is string => !!t))).sort(),
    [matches]
  );

  const filtered = useMemo(() => {
    if (!matches) return [];
    let list = matches;
    if (category !== "all") list = list.filter((m) => tournamentCategory(m.tournament) === category);
    if (tournament !== "all") list = list.filter((m) => m.tournament === tournament);
    if (playerQuery.trim()) {
      const q = playerQuery.toLowerCase();
      list = list.filter(
        (m) => m.players?.p1?.name?.toLowerCase().includes(q) || m.players?.p2?.name?.toLowerCase().includes(q)
      );
    }
    const sorted = [...list].sort((a, b) => {
      let diff = 0;
      if (sortField === "duration") {
        diff = elapsedMinutes(a.scheduled_time) - elapsedMinutes(b.scheduled_time);
      } else {
        diff = new Date(a.scheduled_time ?? 0).getTime() - new Date(b.scheduled_time ?? 0).getTime();
      }
      return sortDir === "asc" ? diff : -diff;
    });
    return sorted;
  }, [matches, category, tournament, playerQuery, sortField, sortDir]);

  if (error) return <p className="text-[var(--text-soft)] text-sm">{error}</p>;
  if (matches === null) return <p className="text-[var(--text-soft)] text-sm">Loading live matches…</p>;
  if (matches.length === 0) return <p className="text-[var(--text-soft)] text-sm">No matches live right now.</p>;

  return (
    <>
      <MatchFilters
        tournaments={tournaments}
        category={category}
        onCategoryChange={setCategory}
        tournament={tournament}
        onTournamentChange={setTournament}
        playerQuery={playerQuery}
        onPlayerQueryChange={setPlayerQuery}
        sortField={sortField}
        onSortFieldChange={setSortField}
        sortOptions={[
          { value: "date", label: "Start time" },
          { value: "duration", label: "Time on court" },
        ]}
        sortDir={sortDir}
        onToggleSortDir={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
      />

      {filtered.length === 0 && <p className="text-[var(--text-soft)] text-sm">No matches match those filters.</p>}

      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((m) => {
          const p1 = m.players?.p1;
          const p2 = m.players?.p2;
          const marquee = isMarqueeMatch({ ranking1: p1?.ranking, ranking2: p2?.ranking, tournament: m.tournament });
          const highlightsUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
            `${p1?.name ?? ""} vs ${p2?.name ?? ""} ${m.tournament ?? ""} highlights`
          )}`;
          const elapsed = elapsedSince(m.scheduled_time);

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
                  lengthLabel: elapsed ? `Started ${formatDate(m.scheduled_time)} · on court ${elapsed}` : formatDate(m.scheduled_time),
                  watchLinks: [{ label: "Find a live stream", url: genericWatchSearchUrl(m.tournament ?? "", m.tour ?? undefined) }],
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

              <p className="text-sm text-[var(--text-soft)] mb-1">{m.tournament}</p>
              <p className="text-xs text-[var(--text-soft)] mb-2">
                {formatDate(m.scheduled_time)}
                {elapsed && <span> · on court {elapsed}</span>}
              </p>

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
