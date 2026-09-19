import { pgTable, text, timestamp, jsonb, serial } from "drizzle-orm/pg-core";

// A shared cache across every visitor. The free Live Tennis API tier caps out
// at 100 requests/day total, so every read goes through this table first.
// one visitor's fetch warms the cache for everyone until it expires.
export const apiCache = pgTable("api_cache", {
  key: text("key").primaryKey(),
  payload: jsonb("payload").notNull(),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull().defaultNow(),
});

// Curated fun facts shown on marquee matches (top players / Grand Slams).
// Matched loosely by player name or tournament name at read time.
export const funFacts = pgTable("fun_facts", {
  id: serial("id").primaryKey(),
  subjectType: text("subject_type").notNull(), // 'player' | 'tournament' | 'general'
  subject: text("subject").notNull(), // player name or tournament name, lowercase
  fact: text("fact").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ApiCacheRow = typeof apiCache.$inferSelect;
export type FunFact = typeof funFacts.$inferSelect;
