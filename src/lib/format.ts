import { gamesForSet } from "livetennisapi";
import type { Score } from "livetennisapi";

/** "6-4, 3-6, 7-6" style summary from a Score object. */
export function formatSets(score?: Score | null): string {
  if (!score?.games || score.games.length === 0) return "";
  const setCount = Math.max(score.games[0]?.length ?? 0, score.games[1]?.length ?? 0);
  const parts: string[] = [];
  for (let i = 0; i < setCount; i++) {
    const [g1, g2] = gamesForSet(score, i);
    if (g1 == null && g2 == null) continue;
    parts.push(`${g1 ?? 0}-${g2 ?? 0}`);
  }
  return parts.join(", ");
}

export function formatCurrentGame(score?: Score | null): string | null {
  if (!score?.points) return null;
  if (score.is_tiebreak) return `${score.points[0]}-${score.points[1]} (TB)`;
  return `${score.points[0]}-${score.points[1]}`;
}

/** Splits a Score's games into [player1SetScores, player2SetScores]. */
export function setsPerPlayer(score?: Score | null): [number[], number[]] {
  if (!score?.games || score.games.length === 0) return [[], []];
  const setCount = Math.max(score.games[0]?.length ?? 0, score.games[1]?.length ?? 0);
  const p1: number[] = [];
  const p2: number[] = [];
  for (let i = 0; i < setCount; i++) {
    const [g1, g2] = gamesForSet(score, i);
    if (g1 == null && g2 == null) continue;
    p1.push(g1 ?? 0);
    p2.push(g2 ?? 0);
  }
  return [p1, p2];
}
