export function formatDate(iso?: string | null): string {
  if (!iso) return "Date unknown";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "Date unknown";
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** "2h 14m" style elapsed time since a match started. Used for live matches only. */
export function elapsedSince(iso?: string | null): string | null {
  if (!iso) return null;
  const start = new Date(iso).getTime();
  if (isNaN(start)) return null;
  const ms = Date.now() - start;
  if (ms < 0) return null;
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

/** Minutes elapsed, for sorting live matches by how long they've been running. */
export function elapsedMinutes(iso?: string | null): number {
  if (!iso) return 0;
  const start = new Date(iso).getTime();
  if (isNaN(start)) return 0;
  return Math.max(0, Math.floor((Date.now() - start) / 60000));
}
