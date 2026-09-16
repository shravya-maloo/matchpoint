const MAJORS = ["australian open", "roland garros", "french open", "wimbledon", "us open"];

export function isMarqueeMatch(opts: {
  ranking1?: number | null;
  ranking2?: number | null;
  tournament?: string | null;
}): boolean {
  const topRanked = (opts.ranking1 != null && opts.ranking1 <= 10) || (opts.ranking2 != null && opts.ranking2 <= 10);
  const isMajor = opts.tournament ? MAJORS.some((m) => opts.tournament!.toLowerCase().includes(m)) : false;
  return topRanked || isMajor;
}
