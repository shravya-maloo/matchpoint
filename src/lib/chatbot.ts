import { getLiveMatches, getUpcomingMatches, searchPlayers } from "./tennis";
import { getRankings } from "./espn";
import { formatSets } from "./format";

function matchName(m: { players?: { p1?: { name?: string }; p2?: { name?: string } } }) {
  return `${m.players?.p1?.name ?? "?"} vs ${m.players?.p2?.name ?? "?"}`;
}

function includesAny(text: string, words: string[]) {
  return words.some((w) => text.includes(w));
}

// Each entry: if the message contains ANY of `keys`, return `answer`.
// Order matters — more specific entries should come first.
const GLOSSARY: { keys: string[]; answer: string }[] = [
  {
    keys: ["deuce"],
    answer:
      "Deuce is when both players have won 3 points in a game (40-40). From deuce, a player must win two points in a row to take the game — the first is called \"advantage.\"",
  },
  {
    keys: ["tiebreak", "tie break", "tie-break"],
    answer:
      "A tiebreak is played when a set reaches 6 games apiece. Players race to 7 points (win by 2); whoever wins the tiebreak wins the set 7-6.",
  },
  {
    keys: ["break point"],
    answer: "A break point is a point that, if won by the receiver, would win them the game — \"breaking\" their opponent's serve.",
  },
  {
    keys: ["double fault"],
    answer: "A double fault is missing both serve attempts in a point — it's an automatic point for the returner.",
  },
  {
    keys: ["fault"],
    answer:
      "A fault is a serve that lands outside the correct service box or otherwise doesn't count. Each player gets two serve attempts per point; missing both is a double fault.",
  },
  { keys: ["ace"], answer: "An ace is a legal serve the returner doesn't even touch — an automatic point for the server." },
  { keys: ["let"], answer: "A \"let\" is a serve that touches the net but still lands in the correct box — it's replayed with no penalty." },
  {
    keys: ["bagel", "breadstick"],
    answer: "A \"bagel\" is a set won 6-0 (the 0 looks like a bagel). A \"breadstick\" is a set won 6-1.",
  },
  {
    keys: ["golden set"],
    answer: "A golden set is winning a set 6-0 without losing a single point to your opponent — extremely rare in professional tennis.",
  },
  {
    keys: ["walkover", "walk over"],
    answer: "A walkover happens when a player withdraws before a match even starts (often injury) — their opponent advances without playing.",
  },
  {
    keys: ["retire", "retirement", "ret."],
    answer: "A retirement is when a player withdraws mid-match, usually due to injury — their opponent is awarded the win.",
  },
  { keys: ["love"], answer: "\"Love\" means zero in tennis scoring — likely from the French \"l'oeuf\" (egg), for its round shape." },
  {
    keys: ["how does scoring work", "how does tennis scoring", "scoring system", "how do points work"],
    answer:
      "Points go 0 (love) → 15 → 30 → 40 → game. Win 6 games (by 2) to take a set; most matches are best-of-3 sets, Grand Slam men's matches are best-of-5.",
  },
  {
    keys: ["grand slam"],
    answer:
      "The four Grand Slams are the Australian Open (hard court), French Open / Roland Garros (clay), Wimbledon (grass), and the US Open (hard court).",
  },
  {
    keys: ["surface"],
    answer:
      "The three main surfaces are hard court (fast, consistent bounce), clay (slow, high bounce, favors long rallies), and grass (fast, low bounce).",
  },
  {
    keys: ["seed", "seeding"],
    answer: "Seeding ranks the top players in a draw so the highest-ranked players are spread apart and can't meet until later rounds.",
  },
  {
    keys: ["singles"],
    answer: "Singles is one player per side. Doubles is two players per side, using the wider alleys of the court as well.",
  },
  { keys: ["doubles"], answer: "Doubles is two players per side. It uses the full width of the court, including the alleys singles doesn't." },
  { keys: ["what is atp", "atp mean", "what does atp stand for"], answer: "ATP (Association of Tennis Professionals) runs the men's professional tour." },
  { keys: ["what is wta", "wta mean", "what does wta stand for"], answer: "WTA (Women's Tennis Association) runs the women's professional tour." },
  {
    keys: ["best of 5", "best-of-5", "best of three", "best-of-3", "how many sets"],
    answer: "Most tour-level matches are best-of-3 sets. Grand Slam men's singles matches are best-of-5; women's are best-of-3 at all events.",
  },
];

async function liveAnswer(): Promise<string> {
  try {
    const matches = await getLiveMatches();
    if (matches.length === 0) return "There are no live matches right now — check the Upcoming tab for what's next.";
    const sample = matches.slice(0, 5).map((m) => `• ${matchName(m)} (${m.tournament ?? "unknown event"}) — ${formatSets(m.score) || "just starting"}`);
    const more = matches.length > 5 ? `\n…and ${matches.length - 5} more.` : "";
    return `${matches.length} match${matches.length === 1 ? "" : "es"} live right now:\n${sample.join("\n")}${more}`;
  } catch {
    return "I couldn't reach live scores just now — try the Live tab directly.";
  }
}

async function upcomingAnswer(): Promise<string> {
  try {
    const fixtures = await getUpcomingMatches();
    if (fixtures.length === 0) return "I don't see any upcoming fixtures loaded right now — check the Upcoming tab.";
    const sample = fixtures.slice(0, 5).map((f) => `• ${f.player1_name ?? "?"} vs ${f.player2_name ?? "?"} (${f.tournament ?? "unknown event"})`);
    return `Upcoming matches:\n${sample.join("\n")}`;
  } catch {
    return "I couldn't reach the fixture list just now — try the Upcoming tab directly.";
  }
}

async function rankingAnswer(tour: "atp" | "wta"): Promise<string> {
  try {
    const rankings = await getRankings(tour, 5);
    if (rankings.length === 0) return "Rankings aren't available right now — try the Rankings tab.";
    const list = rankings.slice(0, 5).map((r) => `${r.rank}. ${r.name}${r.country ? ` (${r.country})` : ""}`).join("\n");
    return `Top 5 ${tour.toUpperCase()}:\n${list}`;
  } catch {
    return "Rankings aren't available right now — try the Rankings tab.";
  }
}

async function playerAnswer(name: string): Promise<string> {
  try {
    const players = await searchPlayers(name);
    if (players.length === 0) return `I couldn't find a player matching "${name}" — try the Players tab to search directly.`;
    const p = players[0];
    const parts = [p.name, p.country ? `(${p.country})` : null, p.ranking ? `— currently ranked #${p.ranking}` : null].filter(Boolean);
    return parts.join(" ");
  } catch {
    return "Player search isn't available right now — try the Players tab.";
  }
}

// Try to pull a player name out of phrases like "how is nadal doing",
// "where does sinner rank", "search for alcaraz".
function extractPlayerName(text: string): string | null {
  const patterns = [
    /(?:how is|how's) ([a-z .'-]+?)(?: doing)?\??$/,
    /(?:where does|what rank is) ([a-z .'-]+?)(?: rank(?:ed)?)?\??$/,
    /(?:search for|find|look up|tell me about) ([a-z .'-]+)\??$/,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m && m[1] && m[1].trim().length > 1) return m[1].trim();
  }
  return null;
}

export async function answerChat(message: string): Promise<string> {
  const text = message.toLowerCase().trim();

  if (!text) return "Ask me about live matches, rankings, upcoming fixtures, a player, or how tennis scoring works!";

  if (includesAny(text, ["thank", "thanks", "thx"])) {
    return "You're welcome! Anything else — live scores, rankings, or a player?";
  }
  if (includesAny(text, ["bye", "goodbye", "see ya"])) {
    return "See you on the court! 🎾";
  }
  if (/\b(hi|hello|hey|yo)\b/.test(text) && text.length < 20) {
    return "Hey! I'm the MatchPoint assistant. Ask me who's playing live, top rankings, a player, or tennis terms like \"deuce\".";
  }

  if (includesAny(text, ["what is matchpoint", "what can you do", "help", "what do you do"])) {
    return "MatchPoint tracks live ATP & WTA tennis — live scores, upcoming matches, recent results, player profiles, and rankings. Ask me things like \"who's live right now\", \"top 5 ATP\", \"how is Sinner doing\", or \"what's a tiebreak\".";
  }

  const playerName = extractPlayerName(text);
  if (playerName) return playerAnswer(playerName);

  if (includesAny(text, ["live", "playing now", "playing right now", "who is playing", "who's playing", "happening now", "on court right now", "current score"])) {
    return liveAnswer();
  }

  if (includesAny(text, ["upcoming", "next match", "schedule", "what's on", "fixtures"])) {
    return upcomingAnswer();
  }

  if (includesAny(text, ["wta rank", "women's rank", "women rank"])) {
    return rankingAnswer("wta");
  }
  if (includesAny(text, ["atp rank", "men's rank", "men rank", "rank", "ranking", "number 1", "#1", "top player"])) {
    return rankingAnswer(includesAny(text, ["wta", "women"]) ? "wta" : "atp");
  }

  for (const entry of GLOSSARY) {
    if (entry.keys.some((k) => text.includes(k))) {
      return entry.answer;
    }
  }

  if (includesAny(text, ["result", "who won", "score of"])) {
    return "For final scores, check the Results tab — I can only pull live in-progress scores directly right now.";
  }
  if (includesAny(text, ["player", "search"])) {
    return "You can search any player by name in the Players tab for their ranking, hand, and playing style.";
  }

  return "I'm not sure about that one — try asking about live matches, rankings, a player's name, upcoming fixtures, or tennis terms like \"deuce\" or \"tiebreak\".";
}
