import { getRecentResults, type ResultMatch } from "./espn";

export type FormResult = "W" | "L";

function nameMatches(candidate: string, target: string): boolean {
  return candidate.trim().toLowerCase() === target.trim().toLowerCase();
}

function resultsForPlayer(results: ResultMatch[], name: string): FormResult[] {
  return results
    .filter((r) => nameMatches(r.player1.name, name) || nameMatches(r.player2.name, name))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .map((r) => {
      const won = nameMatches(r.player1.name, name) ? r.player1.winner : r.player2.winner;
      return won ? "W" : "L";
    });
}

/**
 * Last-5 form for a batch of players in one shot. Fetches the shared
 * recent-results window once (it's cached anyway, so this is nearly free
 * when Results has already loaded it this session) rather than one lookup
 * per player.
 */
export async function getFormForPlayers(names: string[], lookbackDays = 60): Promise<Record<string, FormResult[]>> {
  const uniqueNames = Array.from(new Set(names.filter(Boolean)));
  if (uniqueNames.length === 0) return {};

  const results = await getRecentResults(lookbackDays);
  const map: Record<string, FormResult[]> = {};
  for (const name of uniqueNames) {
    map[name] = resultsForPlayer(results, name);
  }
  return map;
}
