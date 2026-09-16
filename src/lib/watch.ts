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
