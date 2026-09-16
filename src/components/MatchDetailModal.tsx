"use client";

import { useEffect, useState } from "react";
import PlayerAvatar from "./PlayerAvatar";

export type DetailPlayer = { name: string; country?: string | null; ranking?: number | null };

export type DetailData = {
  tour: string;
  tournament: string;
  round?: string;
  status: "live" | "upcoming" | "completed";
  player1: DetailPlayer;
  player2: DetailPlayer;
  /** Per-set game counts, each array same length, one entry per set. */
  perSet1?: number[];
  perSet2?: number[];
  currentGame?: string | null;
  winner?: 1 | 2 | null;
  startTime?: string | null;
  summary?: string | null;
  /** e.g. "on court 2h 14m" or "24 total games" — whatever length signal we actually have for this match. */
  lengthLabel?: string | null;
  /** Ways to actually watch — real broadcaster links when we have them, a search link otherwise. */
  watchLinks?: { label: string; url: string }[];
};

export default function MatchDetailModal({
  data,
  onClose,
  onPlayerClick,
}: {
  data: DetailData;
  onClose: () => void;
  onPlayerClick?: (name: string) => void;
}) {
  const [fact, setFact] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams({
      player1: data.player1.name,
      player2: data.player2.name,
      tournament: data.tournament,
    });
    fetch(`/api/funfact?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => setFact(d.fact ?? null))
      .catch(() => setFact(null));
  }, [data.player1.name, data.player2.name, data.tournament]);

  const highlightsUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    `${data.player1.name} vs ${data.player2.name} ${data.tournament} highlights`
  )}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center overflow-y-auto p-4"
      style={{ background: "rgba(5, 10, 16, 0.75)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card w-full max-w-xl my-6 overflow-hidden"
        style={{ background: "var(--bg-elevated)" }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-2">
            <span className={`tour-badge ${data.tour}`}>{data.tour.toUpperCase()}</span>
            {data.round && <span className="text-xs text-[var(--text-soft)]">{data.round}</span>}
          </div>
          <button onClick={onClose} className="text-[var(--text-soft)] hover:text-[var(--text)] text-lg" aria-label="Close">
            ✕
          </button>
        </div>

        <div className="px-5 py-5">
          <p className="text-sm text-[var(--text-soft)] mb-1">{data.tournament}</p>
          {data.lengthLabel && <p className="text-xs text-[var(--text-soft)] mb-4">{data.lengthLabel}</p>}
          {!data.lengthLabel && <div className="mb-4" />}

          <div className="flex items-center justify-between gap-3 mb-5">
            <PlayerBlock player={data.player1} winner={data.winner === 1} onClick={onPlayerClick} />
            <span className="headline text-sm text-[var(--text-soft)]">VS</span>
            <PlayerBlock player={data.player2} winner={data.winner === 2} align="right" onClick={onPlayerClick} />
          </div>

          {data.status === "upcoming" ? (
            <div className="card p-4 text-center" style={{ background: "var(--bg-elevated-2)" }}>
              <p className="text-xs text-[var(--text-soft)] uppercase tracking-wide mb-1">Scheduled</p>
              <p className="font-medium">
                {data.startTime
                  ? new Date(data.startTime).toLocaleString(undefined, {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })
                  : "Time to be confirmed"}
              </p>
            </div>
          ) : (
            <div className="card p-4" style={{ background: "var(--bg-elevated-2)" }}>
              {data.perSet1 && data.perSet2 && data.perSet1.length > 0 ? (
                <table className="w-full text-center">
                  <tbody>
                    <ScoreRow name={data.player1.name} sets={data.perSet1} winner={data.winner === 1} />
                    <ScoreRow name={data.player2.name} sets={data.perSet2} winner={data.winner === 2} />
                  </tbody>
                </table>
              ) : (
                <p className="text-center text-sm text-[var(--text-soft)]">Score not available yet.</p>
              )}
              {data.currentGame && (
                <p className="text-center mt-3 text-xl font-semibold" style={{ color: "var(--accent)" }}>
                  {data.currentGame}
                </p>
              )}
              {data.summary && <p className="text-center text-xs text-[var(--text-soft)] mt-3">{data.summary}</p>}
            </div>
          )}

          <div className="mt-6">
            <h3 className="headline text-xs text-[var(--text-soft)] mb-2">Watch</h3>
            <div className="flex flex-wrap gap-2">
              {(data.watchLinks && data.watchLinks.length > 0
                ? data.watchLinks
                : [{ label: "Search for where to watch", url: "" }]
              ).map((w, i) => (
                <a
                  key={i}
                  href={w.url || `https://www.google.com/search?q=${encodeURIComponent(`watch ${data.tournament} live stream`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card-hover card px-4 py-2 text-sm font-semibold"
                  style={{ background: "var(--bg-elevated-2)", color: "var(--accent)" }}
                >
                  📺 {w.label}
                </a>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <h3 className="headline text-xs text-[var(--text-soft)] mb-2">Highlights</h3>
            <a
              href={highlightsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="card-hover card flex items-center justify-center gap-2 py-3 font-semibold text-sm"
              style={{ background: "var(--bg-elevated-2)", color: "var(--accent)" }}
            >
              ▶ Search highlights on YouTube
            </a>
          </div>

          <div className="mt-5">
            <h3 className="headline text-xs text-[var(--text-soft)] mb-2">Fun fact</h3>
            <div className="card p-4 text-sm text-[var(--text-soft)]" style={{ background: "var(--bg-elevated-2)" }}>
              {fact ?? "Loading…"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlayerBlock({
  player,
  winner,
  align = "left",
  onClick,
}: {
  player: DetailPlayer;
  winner?: boolean;
  align?: "left" | "right";
  onClick?: (name: string) => void;
}) {
  const clickable = !!onClick;
  return (
    <div className={`flex flex-col items-center gap-1.5 flex-1 ${align === "right" ? "items-center" : ""}`}>
      <button
        onClick={() => onClick?.(player.name)}
        disabled={!clickable}
        className={clickable ? "hover:opacity-80" : ""}
        aria-label={clickable ? `View ${player.name}'s profile` : undefined}
      >
        <PlayerAvatar name={player.name} size={64} />
      </button>
      {clickable ? (
        <button onClick={() => onClick?.(player.name)} className={`text-sm text-center hover:underline ${winner ? "font-bold" : "font-medium"}`}>
          {player.name}
        </button>
      ) : (
        <p className={`text-sm text-center ${winner ? "font-bold" : "font-medium"}`}>{player.name}</p>
      )}
      <p className="text-xs text-[var(--text-soft)]">
        {player.country ?? ""} {player.ranking ? `· #${player.ranking}` : ""}
      </p>
      {winner && (
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(204,255,51,0.15)", color: "var(--accent)" }}>
          WINNER
        </span>
      )}
    </div>
  );
}

function ScoreRow({ name, sets, winner }: { name: string; sets: number[]; winner: boolean }) {
  return (
    <tr>
      <td className={`text-left py-1 pr-3 text-sm ${winner ? "font-bold" : "text-[var(--text-soft)]"}`}>{name}</td>
      {sets.map((s, i) => (
        <td key={i} className={`px-2 py-1 text-xl ${winner ? "font-bold" : "text-[var(--text-soft)]"}`}>
          {s}
        </td>
      ))}
    </tr>
  );
}
