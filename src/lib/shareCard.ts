// Shareable match-result links carry the match data directly in the URL
// (base64url-encoded JSON) instead of looking it up by id server-side. This
// keeps a shared link valid forever (completed-match results never change)
// without needing a "fetch match by id" lookup against ESPN's
// date-scoped scoreboard, which has no direct id-based endpoint.

export type ShareMatchData = {
  t: "atp" | "wta";
  tn: string; // tournament
  r: string; // round
  d: string; // ISO date
  p1: string; // player1 name
  c1: string | null; // player1 country
  p2: string;
  c2: string | null;
  s1: number[]; // player1 set scores
  s2: number[]; // player2 set scores
  w: 1 | 2 | null; // winner
};

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  const b64 = btoa(binary);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(str: string): Uint8Array {
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function encodeShareData(data: ShareMatchData): string {
  const bytes = new TextEncoder().encode(JSON.stringify(data));
  return toBase64Url(bytes);
}

export function decodeShareData(encoded: string): ShareMatchData | null {
  try {
    const bytes = fromBase64Url(encoded);
    const parsed = JSON.parse(new TextDecoder().decode(bytes));
    if (
      !parsed ||
      typeof parsed.p1 !== "string" ||
      typeof parsed.p2 !== "string" ||
      !Array.isArray(parsed.s1) ||
      !Array.isArray(parsed.s2)
    ) {
      return null;
    }
    return parsed as ShareMatchData;
  } catch {
    return null;
  }
}

/** "6-4, 3-6, 7-6" style set-score summary. */
export function formatSetScore(s1: number[], s2: number[]): string {
  const n = Math.max(s1.length, s2.length);
  const parts: string[] = [];
  for (let i = 0; i < n; i++) parts.push(`${s1[i] ?? 0}-${s2[i] ?? 0}`);
  return parts.join(", ");
}
