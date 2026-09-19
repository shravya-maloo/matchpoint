const KNOWN_BROADCASTERS: Record<string, string> = {
  "espn+": "https://plus.espn.com/",
  espn: "https://www.espn.com/watch/",
  "espn2": "https://www.espn.com/watch/",
  "tennis channel": "https://www.tennischannel.com/",
  "sky sports": "https://www.skysports.com/watch",
  "sky sports tennis": "https://www.skysports.com/watch",
  "amazon prime video": "https://www.amazon.com/gp/video/storefront",
  "prime video": "https://www.amazon.com/gp/video/storefront",
  peacock: "https://www.peacocktv.com/",
  nbc: "https://www.nbc.com/live",
  "bein sports": "https://www.beinsports.com/",
  eurosport: "https://www.eurosport.com/watch/",
  wowow: "https://www.wowow.co.jp/",
};

/** Best real link we have for a named broadcaster; a search link otherwise. */
export function watchLinkFor(name: string): string {
  const key = name.trim().toLowerCase();
  if (KNOWN_BROADCASTERS[key]) return KNOWN_BROADCASTERS[key];
  return `https://www.google.com/search?q=${encodeURIComponent(`${name} watch live`)}`;
}

/** Used when we have no broadcaster data at all (live/upcoming matches). */
export function genericWatchSearchUrl(tournament: string, tour?: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(`watch ${tournament} ${tour ?? ""} live stream`.trim())}`;
}

/**
 * Where to look for match highlights: not just one app, but a couple of
 * real entry points. YouTube's search is a solid single source, but Google's
 * general search often surfaces the exact clip or streaming app directly
 * (e.g. an ESPN or Tennis Channel result box), which YouTube alone won't.
 * We deliberately don't include a "universal streaming guide" like
 * JustWatch here since those index movies/TV shows, not individual sports
 * matches, and would just return no results for this query shape.
 */
export function highlightSearchLinks(query: string): { label: string; url: string }[] {
  return [
    { label: "YouTube", url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}` },
    { label: "Google (all apps)", url: `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=vid` },
  ];
}
