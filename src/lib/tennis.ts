import { LiveTennisAPI, type Match, type Fixture, type Player } from "livetennisapi";
import { cachedWithFallback } from "./cache";

function client() {
  const apiKey = process.env.LIVETENNISAPI_KEY;
  if (!apiKey) {
    throw new Error(
      "LIVETENNISAPI_KEY is not set. Get a free key (no card) at https://livetennisapi.com/subscribe/free and add it to .env.local."
    );
  }
  return new LiveTennisAPI({ apiKey });
}

// Live scores change fast but the free tier's 100/day cap means we can't
// poll aggressively, so 20s balances "feels live" against quota.
export async function getLiveMatches(): Promise<Match[]> {
  return cachedWithFallback("tennis:live", 20, async () => {
    const c = client();
    const [atp, wta] = await Promise.all([
      c.listMatches({ status: "live", tour: "atp", limit: 50 }),
      c.listMatches({ status: "live", tour: "wta", limit: 50 }),
    ]);
    return [...atp.data, ...wta.data];
  });
}

export async function getUpcomingMatches(): Promise<Fixture[]> {
  return cachedWithFallback("tennis:upcoming", 300, async () => {
    const c = client();
    const [atp, wta] = await Promise.all([
      c.listFixtures({ tour: "atp", limit: 50 }),
      c.listFixtures({ tour: "wta", limit: 50 }),
    ]);
    return [...atp.data, ...wta.data];
  });
}

export async function searchPlayers(query: string): Promise<Player[]> {
  if (!query.trim()) return [];
  return cachedWithFallback(`tennis:playersearch:${query.toLowerCase()}`, 3600, async () => {
    const c = client();
    const res = await c.searchPlayers(query, { limit: 20 });
    return res.data;
  });
}

export async function getPlayer(playerId: number): Promise<Player | null> {
  return cachedWithFallback(`tennis:player:${playerId}`, 1800, async () => {
    const c = client();
    try {
      return await c.getPlayer(playerId);
    } catch {
      return null;
    }
  });
}

export async function getMatch(matchId: number): Promise<Match | null> {
  return cachedWithFallback(`tennis:match:${matchId}`, 15, async () => {
    const c = client();
    try {
      return await c.getMatch(matchId);
    } catch {
      return null;
    }
  });
}
