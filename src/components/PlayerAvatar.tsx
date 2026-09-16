const COLORS = ["#4da3ff", "#ff6fae", "#ccff33", "#ff8a5c", "#a685ff", "#3fd6c0"];

function colorFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function PlayerAvatar({ name, size = 64 }: { name?: string | null; size?: number }) {
  const label = name ?? "?";
  return (
    <div
      className="rounded-full grid place-items-center font-semibold shrink-0"
      style={{
        width: size,
        height: size,
        background: colorFor(label),
        color: "#0a1420",
        fontSize: size * 0.34,
      }}
      title={label}
    >
      {name ? initials(name) : "?"}
    </div>
  );
}
