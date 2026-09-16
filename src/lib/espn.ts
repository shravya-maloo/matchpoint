import { cachedWithFallback } from "./cache";

const SITE_BASE = "https://site.api.espn.com/apis/site/v2/sports/tennis";

export type ResultMatch = {
  id: string;
  tour: "atp" | "wta";
  tournament: string;
  round: string;
  date: string;
  player1: { name: string; country: string | null; flag: string | null; winner: boolean; sets: number[] };
  player2: { name: string; country: string | null; flag: string | null; winner: boolean; sets: number[] };
  summary: string | null;
  broadcasts: string[];
};

function ymd(d: Date) {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}

async function fetchScoreboard(tour: "atp" | "wta", from: Date, to: Date) {
  const url = `${SITE_BASE}/${tour}/scoreboard?dates=${ymd(from)}-${ymd(to)}&limit=300`;

  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`ESPN scoreboard ${tour} failed: ${res.status}`);
  return res.json();
}

// ESPN's shape, trimmed to what we read.
type EspnCompetitor = {
  winner?: boolean;
  linescores?: { value: number; winner?: boolean }[];
  athlete?: { displayName?: string; flag?: { href?: string; alt?: string } };
};
type EspnCompetition = {
  id: string;
  date: string;
  status?: { type?: { completed?: boolean; description?: string } };
  competitors?: EspnCompetitor[];
  round?: { displayName?: string };
  notes?: { text?: string }[];
  broadcast?: string;
  broadcasts?: { market?: string; names?: string[] }[];
};
type EspnEvent = {
  name?: string;
  groupings?: { competitions?: EspnCompetition[] }[];
};

/**
 * The free-text summary ESPN attaches to a completed match looks like:
 * "Jacob Fearnley (GBR) bt Roberto Carballes Baena (ESP) 7-6 (7-3) 6-3" —
 * winner first. The structured `athlete` object is sometimes missing (lower
 * rounds, qualifying, retired players not in ESPN's roster yet), in which
 * case this is the only place the real names live — so we parse it as a
 * fallback rather than showing "Unknown" when the summary clearly has them.
 */
function parseNamesFromSummary(summary: string | null): { winner: string; winnerCountry: string | null; loser: string; loserCountry: string | null } | null {
  if (!summary) return null;
  const m = summary.match(/^(.+?)\s*\(([A-Za-z]{2,3})\)\s*bt\.?\s*(.+?)\s*\(([A-Za-z]{2,3})\)/i);
  if (!m) return null;
  return { winner: m[1].trim(), winnerCountry: m[2].toUpperCase(), loser: m[3].trim(), loserCountry: m[4].toUpperCase() };
}

function extractResults(tour: "atp" | "wta", json: unknown): ResultMatch[] {
  const events = (json as { events?: EspnEvent[] })?.events ?? [];
  const results: ResultMatch[] = [];

  for (const ev of events) {
    const tournament = ev.name ?? "Tournament";
    for (const grouping of ev.groupings ?? []) {
      for (const comp of grouping.competitions ?? []) {
        if (!comp.status?.type?.completed) continue;
        const [a, b] = comp.competitors ?? [];
        if (!a || !b) continue;

        const summary = comp.notes?.[0]?.text ?? null;
        const parsed = parseNamesFromSummary(summary);

        let name1 = a.athlete?.displayName ?? null;
        let country1 = a.athlete?.flag?.alt ?? null;
        let name2 = b.athlete?.displayName ?? null;
        let country2 = b.athlete?.flag?.alt ?? null;

        if ((!name1 || !name2) && parsed) {
          const aIsWinner = !!a.winner;
          if (!name1) {
            name1 = aIsWinner ? parsed.winner : parsed.loser;
            country1 = country1 ?? (aIsWinner ? parsed.winnerCountry : parsed.loserCountry);
          }
          if (!name2) {
            name2 = aIsWinner ? parsed.loser : parsed.winner;
            country2 = country2 ?? (aIsWinner ? parsed.loserCountry : parsed.winnerCountry);
          }
        }

        const broadcasts = Array.from(
          new Set([...(comp.broadcasts?.flatMap((br) => br.names ?? []) ?? []), ...(comp.broadcast ? [comp.broadcast] : [])])
        );

        results.push({
          id: comp.id,
          tour,
          tournament,
          round: comp.round?.displayName ?? "",
          date: comp.date,
          player1: {
            name: name1 ?? "Unknown",
            country: country1,
            flag: a.athlete?.flag?.href ?? null,
            winner: !!a.winner,
            sets: (a.linescores ?? []).map((s) => s.value),
          },
          player2: {
            name: name2 ?? "Unknown",
            country: country2,
            flag: b.athlete?.flag?.href ?? null,
            winner: !!b.winner,
            sets: (b.linescores ?? []).map((s) => s.value),
          },
          summary,
          broadcasts,
        });
      }
    }
  }

  // Newest first.
  return results.sort((x, y) => new Date(y.date).getTime() - new Date(x.date).getTime());
}

const MAX_RANGE_DAYS = 90;

function parseDateOnly(s: string): Date {
  // Interpreted as UTC midnight so "2026-09-01" means the same calendar day
  // for every caller regardless of local timezone.
  const d = new Date(`${s}T00:00:00Z`);
  if (isNaN(d.getTime())) throw new Error(`Invalid date: ${s}`);
  return d;
}

/**
 * Results for an arbitrary [from, to] calendar-day range (inclusive), both
 * as "YYYY-MM-DD" strings. A range whose `to` day is today or yesterday is
 * cached briefly since a match in progress there could still complete; an
 * older, fully-settled range is cached for a day since ESPN's history for
 * finished tournaments doesn't change.
 */
export async function getResultsInRange(fromStr: string, toStr: string): Promise<ResultMatch[]> {
  const from = parseDateOnly(fromStr);
  const to = parseDateOnly(toStr);
  if (from.getTime() > to.getTime()) throw new Error("`from` date must not be after `to` date.");

  const rangeDays = Math.round((to.getTime() - from.getTime()) / 86400000) + 1;
  if (rangeDays > MAX_RANGE_DAYS) {
    throw new Error(`Date range too wide — max ${MAX_RANGE_DAYS} days, got ${rangeDays}.`);
  }

  const daysSinceRangeEnd = Math.floor((Date.now() - to.getTime()) / 86400000);
  const ttlSeconds = daysSinceRangeEnd <= 1 ? 900 : 86400;

  return cachedWithFallback(`espn:results:${fromStr}:${toStr}`, ttlSeconds, async () => {
    const [atpJson, wtaJson] = await Promise.all([
      fetchScoreboard("atp", from, to),
      fetchScoreboard("wta", from, to),
    ]);
    return [...extractResults("atp", atpJson), ...extractResults("wta", wtaJson)];
  });
}

/** Convenience wrapper for the common "last N days through today" case. */
export async function getRecentResults(daysBack = 4): Promise<ResultMatch[]> {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - daysBack);
  const ymdStr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return getResultsInRange(ymdStr(from), ymdStr(to));
}

