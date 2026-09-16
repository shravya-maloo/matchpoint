"use client";

import { useEffect, useMemo, useState } from "react";
import type { ResultMatch } from "@/lib/espn";
import FunFactButton from "@/components/FunFactButton";
import { isMarqueeMatch } from "@/lib/marquee";
import { tournamentCategory, type TournamentCategory } from "@/lib/tournamentCategory";
import { formatDate } from "@/lib/dates";
import { watchLinkFor } from "@/lib/watch";
import MatchDetailModal, { type DetailData } from "@/components/MatchDetailModal";
import MatchFilters from "@/components/MatchFilters";

function totalGames(r: ResultMatch): number {
  return [...r.player1.sets, ...r.player2.sets].reduce((sum, n) => sum + n, 0);
}

export default function ResultsTab() {
  const [results, setResults] = useState<ResultMatch[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<DetailData | null>(null);

  const [category, setCategory] = useState<TournamentCategory | "all">("all");
  const [tournament, setTournament] = useState("all");
  const [playerQuery, setPlayerQuery] = useState("");
  const [sortField, setSortField] = useState("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    fetch("/api/results?days=5")
      .then((r) => r.json())
      .then((data) => (data.results ? setResults(data.results) : setError(data.error ?? "Failed to load")))
      .catch(() => setError("Failed to load results"));
  }, []);

  const tournaments = useMemo(
    () => Array.from(new Set((results ?? []).map((r) => r.tournament))).sort(),
    [results]
  );

  const filtered = useMemo(() => {
    if (!results) return [];
    let list = results;
    if (category !== "all") list = list.filter((r) => tournamentCategory(r.tournament) === category);
    if (tournament !== "all") list = list.filter((r) => r.tournament === tournament);
    if (playerQuery.trim()) {
      const q = playerQuery.toLowerCase();
      list = list.filter(
        (r) => r.player1.name.toLowerCase().includes(q) || r.player2.name.toLowerCase().includes(q)
      );
    }
    const sorted = [...list].sort((a, b) => {
      let diff = 0;
      if (sortField === "games") diff = totalGames(a) - totalGames(b);
      else diff = new Date(a.date).getTime() - new Date(b.date).getTime();
      return sortDir === "asc" ? diff : -diff;
    });
    return sorted;
  }, [results, category, tournament, playerQuery, sortField, sortDir]);

  if (error) return <p className="text-[var(--text-soft)] text-sm">{error}</p>;
  if (results === null) return <p className="text-[var(--text-soft)] text-sm">Loading recent results…</p>;
  if (results.length === 0) return <p className="text-[var(--text-soft)] text-sm">No completed matches in the last few days.</p>;

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
          { value: "date", label: "Date" },
          { value: "games", label: "Total games (length proxy)" },
        ]}
        sortDir={sortDir}
        onToggleSortDir={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
      />

      {filtered.length === 0 && <p className="text-[var(--text-soft)] text-sm">No matches match those filters.</p>}

      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((r) => {
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
                  lengthLabel: `${formatDate(r.date)} · ${totalGames(r)} total games`,
                  watchLinks: r.broadcasts.map((b) => ({ label: b, url: watchLinkFor(b) })),
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
              <p className="text-sm text-[var(--text-soft)] mb-1">{r.tournament}</p>
              <p className="text-xs text-[var(--text-soft)] mb-2">
                {formatDate(r.date)} · {totalGames(r)} total games
              </p>
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
