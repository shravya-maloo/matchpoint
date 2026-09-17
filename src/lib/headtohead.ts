import { getRecentResults, type ResultMatch } from "./espn";

export type H2HRecord = {
  matches: ResultMatch[];
  player1Wins: number;
  player2Wins: number;
};

function nameMatches(candidate: string, target: string): boolean {
  return candidate.trim().toLowerCase() === target.trim().toLowerCase();
}

/**
 * Head-to-head within the results window we actually have (ESPN's scoreboard
 * caps at 90 days back — there's no career-history endpoint available here),
 * so this is "recent head-to-head," not a full career record. Callers should
 * label it that way rather than implying it's exhaustive.
 */
export async function getHeadToHead(name1: string, name2: string, lookbackDays = 89): Promise<H2HRecord> {
  const results = await getRecentResults(lookbackDays);
  const matches = results
    .filter(
      (r) =>
        (nameMatches(r.player1.name, name1) && nameMatches(r.player2.name, name2)) ||
        (nameMatches(r.player1.name, name2) && nameMatches(r.player2.name, name1))
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  let player1Wins = 0;
  let player2Wins = 0;
  for (const m of matches) {
    const p1Won = nameMatches(m.player1.name, name1) ? m.player1.winner : m.player2.winner;
    if (p1Won) player1Wins++;
    else player2Wins++;
  }

  return { matches, player1Wins, player2Wins };
}
