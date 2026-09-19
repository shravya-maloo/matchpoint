"use client";

import { useEffect, useMemo, useState } from "react";
import type { ResultMatch } from "@/lib/espn";
import FunFactButton from "@/components/FunFactButton";
import { isMarqueeMatch } from "@/lib/marquee";
import { tournamentCategory, type TournamentCategory } from "@/lib/tournamentCategory";
import { formatDate } from "@/lib/dates";
import { watchLinkFor, highlightSearchLinks } from "@/lib/watch";
import MatchDetailModal, { type DetailData } from "@/components/MatchDetailModal";
import MatchFilters from "@/components/MatchFilters";
import DateRangePicker from "@/components/DateRangePicker";
import ShareButton from "@/components/ShareButton";
import type { ShareMatchData } from "@/lib/shareCard";
import FormIndicator from "@/components/FormIndicator";
import type { FormResult } from "@/lib/form";

function totalGames(r: ResultMatch): number {
  return [...r.player1.sets, ...r.player2.sets].reduce((sum, n) => sum + n, 0);
}

function shareDataFor(r: ResultMatch): ShareMatchData {
  return {
    t: r.tour,
    tn: r.tournament,
    r: r.round,
    d: r.date,
    p1: r.player1.name,
    c1: r.player1.country,
    p2: r.player2.name,
    c2: r.player2.country,
    s1: r.player1.sets,
    s2: r.player2.sets,
    w: r.player1.winner ? 1 : r.player2.winner ? 2 : null,
  };
}

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const DEFAULT_TO = ymd(new Date());
const DEFAULT_FROM = ymd(new Date(Date.now() - 5 * 86400000));

export default function ResultsTab({ onPlayerClick }: { onPlayerClick: (name: string) => void }) {
  const [results, setResults] = useState<ResultMatch[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<DetailData | null>(null);

  const [from, setFrom] = useState(DEFAULT_FROM);
  const [to, setTo] = useState(DEFAULT_TO);

  const [category, setCategory] = useState<TournamentCategory | "all">("all");
  const [tournament, setTournament] = useState("all");
  const [playerQuery, setPlayerQuery] = useState("");
  const [sortField, setSortField] = useState("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [formMap, setFormMap] = useState<Record<string, FormResult[]>>({});

  const MAX_RANGE_DAYS = 90;
  const rangeValid = useMemo(() => {
    const fromMs = new Date(`${from}T00:00:00Z`).getTime();
    const toMs = new Date(`${to}T00:00:00Z`).getTime();
    if (isNaN(fromMs) || isNaN(toMs) || fromMs > toMs) return false;
    const days = Math.round((toMs - fromMs) / 86400000) + 1;
    return days <= MAX_RANGE_DAYS;
  }, [from, to]);

  useEffect(() => {
    if (!rangeValid) return;
    setResults(null);
    setError(null);
    fetch(`/api/results?from=${from}&to=${to}`)
      .then((r) => r.json())
      .then((data) => (data.results ? setResults(data.results) : setError(data.error ?? "Failed to load")))
      .catch(() => setError("Failed to load results"));
  }, [from, to, rangeValid]);

  const tournaments = useMemo(
    () => Array.from(new Set((results ?? []).map((r) => r.tournament))).sort(),
    [results]
  );

  useEffect(() => {
    if (!results || results.length === 0) return;
    const names = Array.from(new Set(results.flatMap((r) => [r.player1.name, r.player2.name])));
    fetch("/api/players/form-batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ names }),
    })
      .then((r) => r.json())
      .then((d) => setFormMap(d.form ?? {}))
      .catch(() => {});
  }, [results]);

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

  return (
    <>
      <DateRangePicker from={from} to={to} onChange={(nf, nt) => { setFrom(nf); setTo(nt); }} />

      {rangeValid && error && <p className="text-[var(--text-soft)] text-sm">{error}</p>}
      {rangeValid && !error && results === null && <p className="text-[var(--text-soft)] text-sm">Loading results…</p>}
      {rangeValid && !error && results !== null && results.length === 0 && (
        <p className="text-[var(--text-soft)] text-sm">No completed matches in that date range.</p>
      )}

      {rangeValid && results !== null && results.length > 0 && (
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
                  <ResultRow name={r.player1.name} winner={r.player1.winner} sets={r.player1.sets} onPlayerClick={onPlayerClick} form={formMap[r.player1.name]} />
                  <ResultRow name={r.player2.name} winner={r.player2.winner} sets={r.player2.sets} onPlayerClick={onPlayerClick} form={formMap[r.player2.name]} />
                  {r.summary && <p className="text-xs text-[var(--text-soft)] mt-2">{r.summary}</p>}
                  <div className="flex items-center justify-between mt-2 gap-2">
                    <div className="flex items-center gap-3">
                      {highlightSearchLinks(`${r.player1.name} vs ${r.player2.name} ${r.tournament} highlights`).map((h, i) => (
                        <a
                          key={i}
                          href={h.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs font-semibold inline-block"
                          style={{ color: "var(--accent)" }}
                        >
                          ▶ {h.label}
                        </a>
                      ))}
                    </div>
                    <ShareButton data={shareDataFor(r)} />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

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

function ResultRow({
  name,
  winner,
  sets,
  onPlayerClick,
  form,
}: {
  name: string;
  winner: boolean;
  sets: number[];
  onPlayerClick: (name: string) => void;
  form?: FormResult[];
}) {
  return (
    <div className="flex items-center justify-between text-sm py-0.5">
      <span className="flex items-center gap-1.5 min-w-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPlayerClick(name);
          }}
          className={`hover:underline text-left truncate ${winner ? "font-semibold" : "text-[var(--text-soft)]"}`}
        >
          {name}
        </button>
        <FormIndicator form={form} />
      </span>
      <span className={`flex gap-2 shrink-0 ${winner ? "font-semibold" : "text-[var(--text-soft)]"}`}>
        {sets.map((s, i) => (
          <span key={i} className="w-4 text-center">
            {s}
          </span>
        ))}
      </span>
    </div>
  );
}
