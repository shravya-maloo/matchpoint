import { db, ensureReady } from "@/db";
import { funFacts } from "@/db/schema";
import { and, eq, ilike, or } from "drizzle-orm";

// Always-available fallback so the feature works even with an empty table.
// General tennis trivia — nothing tied to a specific match result, so it's
// never at risk of going stale or wrong.
const GENERIC_FACTS = [
  "The Wimbledon Championships is the only Grand Slam still played on grass.",
  "A tennis match has no game clock — it ends only when the last point is won, which is why some matches have lasted over 11 hours.",
  "The term \"love\" for zero is thought to come from the French \"l'oeuf\" (the egg), for its round shape.",
  "The fastest recorded competitive tennis serve was in the 260 km/h (163 mph) range.",
  "Yellow tennis balls only became standard in the 1970s, after research found them more visible on television.",
  "The four Grand Slam tournaments are played on three different surfaces: clay (French Open), grass (Wimbledon), and hard court (Australian & US Open).",
  "Tiebreaks weren't introduced to Grand Slam tennis until the 1970s — before that, sets could theoretically go on forever.",
  "A \"golden set\" — winning a set 6-0 without losing a single point — has happened only a handful of times in professional history.",
  "Roland Garros, the French Open venue, is named after a World War I aviator, not a tennis player.",
  "Players switch ends of the court every odd game to offset any advantage from sun, wind, or court conditions.",
];

export async function getFunFact(opts: { player1?: string; player2?: string; tournament?: string }): Promise<string> {
  await ensureReady();

  const clauses = [];
  if (opts.player1) clauses.push(and(eq(funFacts.subjectType, "player"), ilike(funFacts.subject, `%${opts.player1}%`)));
  if (opts.player2) clauses.push(and(eq(funFacts.subjectType, "player"), ilike(funFacts.subject, `%${opts.player2}%`)));
  if (opts.tournament)
    clauses.push(and(eq(funFacts.subjectType, "tournament"), ilike(funFacts.subject, `%${opts.tournament}%`)));

  if (clauses.length > 0) {
    const [match] = await db
      .select()
      .from(funFacts)
      .where(or(...clauses))
      .limit(1);
    if (match) return match.fact;
  }

  return GENERIC_FACTS[Math.floor(Math.random() * GENERIC_FACTS.length)];
}
