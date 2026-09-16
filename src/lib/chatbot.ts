import { getLiveMatches } from "./tennis";
import { getRankings } from "./espn";

function matchName(m: { players?: { p1?: { name?: string }; p2?: { name?: string } } }) {
  return `${m.players?.p1?.name ?? "?"} vs ${m.players?.p2?.name ?? "?"}`;
}

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
    answer:
      "A break point is a point that, if won by the receiver, would win them the game — \"breaking\" their opponent's serve.",
  },
  {
    keys: ["ace"],
    answer: "An ace is a legal serve the returner doesn't even touch — an automatic point for the server.",
  },
  {
    keys: ["love"],
    answer: "\"Love\" means zero in tennis scoring — likely from the French \"l'oeuf\" (egg), for its round shape.",
  },
  {
    keys: ["scoring", "how does scoring work", "how does tennis scoring"],
    answer:
      "Points go 0 (love) → 15 → 30 → 40 → game. Win 6 games (by 2) to take a set; most matches are best-of-3 sets, Grand Slam men's matches are best-of-5.",
  },
  {
    keys: ["grand slam", "grand slams"],
    answer:
      "The four Grand Slams are the Australian Open (hard court), French Open / Roland Garros (clay), Wimbledon (grass), and the US Open (hard court).",
  },
  {
    keys: ["surface", "surfaces"],
    answer:
      "The three main surfaces are hard court (fast, consistent bounce), clay (slow, high bounce, favors long rallies), and grass (fast, low bounce).",
  },
];

async function liveAnswer(): Promise<string> {
  try {
    const matches = await getLiveMatches();
    if (matches.length === 0) return "There are no live matches right now — check the Upcoming tab for what's next.";
    const sample = matches.slice(0, 5).map((m) => `• ${matchName(m)} (${m.tournament ?? "unknown event"})`);
    const more = matches.length > 5 ? `\n…and ${matches.length - 5} more.` : "";
    return `${matches.length} match${matches.length === 1 ? "" : "es"} live right now:\n${sample.join("\n")}${more}`;
  } catch {
    return "I couldn't reach live scores just now — try the Live tab directly.";
  }
}

async function rankingAnswer(tour: "atp" | "wta"): Promise<string> {
  try {
    const rankings = await getRankings(tour, 5);
    if (rankings.length === 0) return "Rankings aren't available right now — try the Rankings tab.";
    const list = rankings
      .slice(0, 5)
      .map((r) => `${r.rank}. ${r.name}${r.country ? ` (${r.country})` : ""}`)
      .join("\n");
    return `Top 5 ${tour.toUpperCase()}:\n${list}`;
  } catch {
    return "Rankings aren't available right now — try the Rankings tab.";
  }
}

export async function answerChat(message: string): Promise<string> {
  const text = message.toLowerCase().trim();

  if (!text) return "Ask me about live matches, rankings, or how tennis scoring works!";

  if (/\b(hi|hello|hey)\b/.test(text)) {
    return "Hey! I'm the MatchPoint assistant. Ask me who's playing live, top rankings, or how tennis scoring works.";
  }

  if (/(what (is|can)|help|about) .*(matchpoint|you)/.test(text) || text === "help") {
    return "MatchPoint tracks live ATP & WTA tennis — live scores, upcoming matches, recent results, player profiles, and rankings. Ask me things like \"who's live right now\" or \"what's a tiebreak\".";
  }

  if (/\blive\b|\bplaying now\b|who.?s playing/.test(text)) {
    return liveAnswer();
  }

  if (/\bwta\b.*rank|women.*rank/.test(text)) {
    return rankingAnswer("wta");
  }
  if (/\batp\b.*rank|men.*rank|\brank/.test(text)) {
    return rankingAnswer(/wta|women/.test(text) ? "wta" : "atp");
  }

  for (const entry of GLOSSARY) {
    if (entry.keys.some((k) => text.includes(k))) {
      return entry.answer;
    }
  }

  return "I'm not sure about that one — try asking about live matches, rankings, or tennis terms like \"deuce\" or \"tiebreak\".";
}
