import { db, ensureReady } from "@/db";
import { apiCache } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Returns the cached payload for `key` if it's younger than `ttlSeconds`;
 * otherwise calls `fetcher()`, stores the result, and returns it.
 *
 * This is a plain read-through cache, not a lock — two requests racing past
 * an expired entry will both call `fetcher()` and the last write wins. That's
 * fine here: the fetcher is idempotent (a GET against the tennis API) and the
 * race window is tiny compared to the TTLs we use.
 */
export async function cached<T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>): Promise<T> {
  await ensureReady();

  const [row] = await db.select().from(apiCache).where(eq(apiCache.key, key));
  if (row) {
    const ageSeconds = (Date.now() - new Date(row.fetchedAt).getTime()) / 1000;
    if (ageSeconds < ttlSeconds) {
      return row.payload as T;
    }
  }

  const fresh = await fetcher();

  await db
    .insert(apiCache)
    .values({ key, payload: fresh as unknown as object, fetchedAt: new Date() })
    .onConflictDoUpdate({
      target: apiCache.key,
      set: { payload: fresh as unknown as object, fetchedAt: new Date() },
    });

  return fresh;
}

/**
 * Like `cached`, but returns stale data instead of throwing if the fetcher
 * fails and a stale row exists — used for anything we'd rather show slightly
 * out of date than not at all (e.g. rankings, results).
 */
export async function cachedWithFallback<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  await ensureReady();
  const [row] = await db.select().from(apiCache).where(eq(apiCache.key, key));

  if (row) {
    const ageSeconds = (Date.now() - new Date(row.fetchedAt).getTime()) / 1000;
    if (ageSeconds < ttlSeconds) {
      return row.payload as T;
    }
  }

  try {
    const fresh = await fetcher();
    await db
      .insert(apiCache)
      .values({ key, payload: fresh as unknown as object, fetchedAt: new Date() })
      .onConflictDoUpdate({
        target: apiCache.key,
        set: { payload: fresh as unknown as object, fetchedAt: new Date() },
      });
    return fresh;
  } catch (err) {
    if (row) return row.payload as T;
    throw err;
  }
}
