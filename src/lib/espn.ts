import { cachedWithFallback } from "./cache";

const SITE_BASE = "https://site.api.espn.com/apis/site/v2/sports/tennis";
const CORE_BASE = "https://sports.core.api.espn.com/v2/sports/tennis/leagues";

export type ResultMatch = {
  id: string;
  tour: "atp" | "wta";
  tournament: string;
  round: string;
  date: string;
  player1: { name: string; country: string | null; flag: string | null; winner: boolean; sets: number[] };
  player2: { name: string; country: string | null; flag: string | null; winner: boolean; sets: number[] };
  summary: string | null;
};

function ymd(d: Date) {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}

async function fetchScoreboard(tour: "atp" | "wta", daysBack: number) {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - daysBack);
  const url = `${SITE_BASE}/${tour}/scoreboard?dates=${ymd(from)}-${ymd(to)}&limit=200`;

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
};
type EspnEvent = {
  name?: string;
  groupings?: { competitions?: EspnCompetition[] }[];
};

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

        results.push({
          id: comp.id,
          tour,
          tournament,
          round: comp.round?.displayName ?? "",
          date: comp.date,
          player1: {
            name: a.athlete?.displayName ?? "Unknown",
            country: a.athlete?.flag?.alt ?? null,
            flag: a.athlete?.flag?.href ?? null,
            winner: !!a.winner,
            sets: (a.linescores ?? []).map((s) => s.value),
          },
          player2: {
            name: b.athlete?.displayName ?? "Unknown",
            country: b.athlete?.flag?.alt ?? null,
            flag: b.athlete?.flag?.href ?? null,
            winner: !!b.winner,
            sets: (b.linescores ?? []).map((s) => s.value),
          },
          summary: comp.notes?.[0]?.text ?? null,
        });
      }
    }
  }

  // Newest first.
  return results.sort((x, y) => new Date(y.date).getTime() - new Date(x.date).getTime());
}

export async function getRecentResults(daysBack = 4): Promise<ResultMatch[]> {
  return cachedWithFallback(`espn:results:${daysBack}`, 900, async () => {
    const [atpJson, wtaJson] = await Promise.all([
      fetchScoreboard("atp", daysBack),
      fetchScoreboard("wta", daysBack),
    ]);
    return [...extractResults("atp", atpJson), ...extractResults("wta", wtaJson)];
  });
}

// --- Rankings (ESPN core API) ------------------------------------------
// The core API returns a paged list of $ref links rather than embedded
// objects, so building a top-100 table means resolving each ref. We do it in
// small concurrent batches and cache the final result for a day, since
// rankings barely move day to day.

export type RankingEntry = {
  rank: number;
  name: string;
  country: string | null;
  points: number | null;
};

async function resolveRef<T>(ref: string): Promise<T> {
  // ESPN's core API sometimes emits $ref links on its internal .pvt domain,
  // which isn't publicly resolvable — rewrite to the public .com host.
  const url = ref.replace("sports.core.api.espn.pvt", "sports.core.api.espn.com");
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`ESPN ref failed: ${res.status} ${url}`);
  return res.json();
}

async function resolveInBatches<T, R>(items: T[], batchSize: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    out.push(...(await Promise.all(batch.map(fn))));
  }
  return out;
}

export async function getRankings(tour: "atp" | "wta", limit = 100): Promise<RankingEntry[]> {
  return cachedWithFallback(`espn:rankings:${tour}:${limit}`, 86400, async () => {
    const listUrl = `${CORE_BASE}/${tour}/rankings?limit=${limit}`;
    const list = await resolveRef<Record<string, unknown>>(listUrl);

    // The exact key holding the list of refs isn't documented and has been
    // observed to vary — try the plausible candidates in order rather than
    // assuming one and silently returning nothing if it's wrong.
    const candidateArrays = [list.items, list.ranks, list.rankings, list.athletes].filter(
      (v): v is unknown[] => Array.isArray(v) && v.length > 0
    );

    if (candidateArrays.length === 0) {
      throw new Error(
        `ESPN rankings response for ${tour} had no recognizable list field (checked items/ranks/rankings/athletes). Keys present: ${Object.keys(
          list
        ).join(", ")}`
      );
    }

    const rawItems = candidateArrays[0] as { $ref?: string }[];
    const refs = rawItems.map((i) => i?.$ref).filter((r): r is string => !!r);

    if (refs.length === 0) {
      throw new Error(`ESPN rankings response for ${tour} had list items but none carried a $ref to follow.`);
    }

    type RankingRef = {
      current?: number;
      rank?: number;
      points?: number | null;
      athlete?: { $ref?: string; displayName?: string; flag?: { alt?: string } };
    };

    const rankingRecords = await resolveInBatches(refs, 10, (ref) => resolveRef<RankingRef>(ref));

    const withAthletes = await resolveInBatches(rankingRecords, 10, async (r) => {
      let athleteName = r.athlete?.displayName ?? null;
      let country = r.athlete?.flag?.alt ?? null;
      if (!athleteName && r.athlete?.$ref) {
        try {
          const athlete = await resolveRef<{ displayName?: string; flag?: { alt?: string } }>(r.athlete.$ref);
          athleteName = athlete.displayName ?? null;
          country = athlete.flag?.alt ?? null;
        } catch {
          // leave null; we'd rather show "Unknown" than fail the whole list
        }
      }
      return {
        rank: r.current ?? r.rank ?? 0,
        name: athleteName ?? "Unknown",
        country,
        points: r.points ?? null,
      } satisfies RankingEntry;
    });

    const final = withAthletes.filter((r) => r.rank > 0).sort((a, b) => a.rank - b.rank);
    if (final.length === 0) {
      throw new Error(`ESPN rankings for ${tour} resolved ${rankingRecords.length} refs but none had a usable rank.`);
    }
    return final;
  });
}
