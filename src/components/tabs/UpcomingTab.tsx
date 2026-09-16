"use client";

import { useEffect, useMemo, useState } from "react";
import type { Fixture } from "livetennisapi";
import { formatDate } from "@/lib/dates";
import { genericWatchSearchUrl } from "@/lib/watch";
import { tournamentCategory, type TournamentCategory } from "@/lib/tournamentCategory";
import MatchDetailModal, { type DetailData } from "@/components/MatchDetailModal";
import MatchFilters from "@/components/MatchFilters";

export default function UpcomingTab({ onPlayerClick }: { onPlayerClick: (name: string) => void }) {
  const [fixtures, setFixtures] = useState<Fixture[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<DetailData | null>(null);

  const [category, setCategory] = useState<TournamentCategory | "all">("all");
  const [tournament, setTournament] = useState("all");
  const [playerQuery, setPlayerQuery] = useState("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    fetch("/api/upcoming")
      .then((r) => r.json())
      .then((data) => (data.fixtures ? setFixtures(data.fixtures) : setError(data.error ?? "Failed to load")))
      .catch(() => setError("Failed to load upcoming matches"));
  }, []);

  const tournaments = useMemo(
    () => Array.from(new Set((fixtures ?? []).map((f) => f.tournament).filter((t): t is string => !!t))).sort(),
    [fixtures]
  );

  const filtered = useMemo(() => {
    if (!fixtures) return [];
    let list = fixtures;
    if (category !== "all") list = list.filter((f) => tournamentCategory(f.tournament) === category);
    if (tournament !== "all") list = list.filter((f) => f.tournament === tournament);
    if (playerQuery.trim()) {
      const q = playerQuery.toLowerCase();
      list = list.filter(
        (f) => f.player1_name?.toLowerCase().includes(q) || f.player2_name?.toLowerCase().includes(q)
      );
    }
    const sorted = [...list].sort((a, b) => {
      const diff = new Date(a.start_time ?? a.event_date ?? 0).getTime() - new Date(b.start_time ?? b.event_date ?? 0).getTime();
      return sortDir === "asc" ? diff : -diff;
    });
    return sorted;
  }, [fixtures, category, tournament, playerQuery, sortDir]);

  if (error) return <p className="text-[var(--text-soft)] text-sm">{error}</p>;
  if (fixtures === null) return <p className="text-[var(--text-soft)] text-sm">Loading fixtures…</p>;
  if (fixtures.length === 0) return <p className="text-[var(--text-soft)] text-sm">No upcoming fixtures found.</p>;

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
        sortField="date"
        onSortFieldChange={() => {}}
        sortOptions={[{ value: "date", label: "Start time (earliest/latest)" }]}
        sortDir={sortDir}
        onToggleSortDir={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
      />

      {filtered.length === 0 && <p className="text-[var(--text-soft)] text-sm">No matches match those filters.</p>}

      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((f) => (
          <div
            key={f.id}
            className="card card-hover p-4 cursor-pointer"
            onClick={() =>
              setSelected({
                tour: f.tour ?? "atp",
                tournament: f.tournament ?? "Tournament",
                round: f.round ?? undefined,
                status: "upcoming",
                player1: { name: f.player1_name ?? "TBD" },
                player2: { name: f.player2_name ?? "TBD" },
                startTime: f.start_time,
                watchLinks: [{ label: "Find a live stream", url: genericWatchSearchUrl(f.tournament ?? "", f.tour ?? undefined) }],
              })
            }
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={`tour-badge ${f.tour ?? "atp"}`}>{(f.tour ?? "").toUpperCase()}</span>
              <span className="text-xs text-[var(--text-soft)]">{f.round}</span>
            </div>
            <p className="text-sm text-[var(--text-soft)] mb-2">{f.tournament}</p>
            <p className="text-sm font-medium flex items-center gap-1 flex-wrap">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (f.player1_name) onPlayerClick(f.player1_name);
                }}
                className="hover:underline"
              >
                {f.player1_name ?? "TBD"}
              </button>
              <span className="text-[var(--text-soft)]">vs</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (f.player2_name) onPlayerClick(f.player2_name);
                }}
                className="hover:underline"
              >
                {f.player2_name ?? "TBD"}
              </button>
            </p>
            <p className="text-xs text-[var(--text-soft)] mt-1">
              {f.start_time ? formatDate(f.start_time) : "Time to be confirmed"}
            </p>
          </div>
        ))}
      </div>

      {selected && (
        <MatchDetailModal
          data={selected}
          onClose={() => setSelected(null)}
          onPlayerClick={(name) => {
            setSelected(null);
            onPlayerClick(name);
          }}
        />
      )}
    </>
  );
}
