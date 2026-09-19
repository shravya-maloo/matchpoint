export type TournamentCategory = "grand_slam" | "masters" | "other";

const GRAND_SLAMS = ["australian open", "roland garros", "french open", "wimbledon", "us open"];

// Best-effort list of the main ATP Masters 1000 / WTA 1000-equivalent events.
// Heuristic, not exhaustive: tournament names not on this list (and not a
// Grand Slam) fall into "Tour" rather than being guessed at.
const MASTERS = [
  "indian wells",
  "miami open",
  "monte-carlo",
  "monte carlo",
  "madrid open",
  "italian open",
  "rome",
  "canadian open",
  "national bank open",
  "cincinnati",
  "shanghai masters",
  "paris masters",
  "atp finals",
  "wta finals",
  "doha",
  "qatar",
  "dubai",
  "indian wells masters",
];

export function tournamentCategory(tournament?: string | null): TournamentCategory {
  if (!tournament) return "other";
  const t = tournament.toLowerCase();
  if (GRAND_SLAMS.some((g) => t.includes(g))) return "grand_slam";
  if (MASTERS.some((m) => t.includes(m))) return "masters";
  return "other";
}

export const CATEGORY_LABEL: Record<TournamentCategory, string> = {
  grand_slam: "Grand Slam",
  masters: "Masters / Premier",
  other: "Tour",
};
