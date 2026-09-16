"use client";

import { useEffect, useState } from "react";
import type { Fixture } from "livetennisapi";
import MatchDetailModal, { type DetailData } from "@/components/MatchDetailModal";

export default function UpcomingTab() {
  const [fixtures, setFixtures] = useState<Fixture[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<DetailData | null>(null);

  useEffect(() => {
    fetch("/api/upcoming")
      .then((r) => r.json())
      .then((data) => (data.fixtures ? setFixtures(data.fixtures) : setError(data.error ?? "Failed to load")))
      .catch(() => setError("Failed to load upcoming matches"));
  }, []);

  if (error) return <p className="text-[var(--text-soft)] text-sm">{error}</p>;
  if (fixtures === null) return <p className="text-[var(--text-soft)] text-sm">Loading fixtures…</p>;
  if (fixtures.length === 0) return <p className="text-[var(--text-soft)] text-sm">No upcoming fixtures found.</p>;

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        {fixtures.map((f) => (
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
              })
            }
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={`tour-badge ${f.tour ?? "atp"}`}>{(f.tour ?? "").toUpperCase()}</span>
              <span className="text-xs text-[var(--text-soft)]">{f.round}</span>
            </div>
            <p className="text-sm text-[var(--text-soft)] mb-2">{f.tournament}</p>
            <p className="text-sm font-medium">
              {f.player1_name ?? "TBD"} <span className="text-[var(--text-soft)]">vs</span> {f.player2_name ?? "TBD"}
            </p>
            {f.start_time && (
              <p className="text-xs text-[var(--text-soft)] mt-1">
                {new Date(f.start_time).toLocaleString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>
        ))}
      </div>

      {selected && <MatchDetailModal data={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
