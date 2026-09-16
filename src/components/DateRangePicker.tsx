"use client";

const MAX_RANGE_DAYS = 90;

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function daysAgo(n: number): string {
  return ymd(new Date(Date.now() - n * 86400000));
}

const PRESETS = [
  { label: "Last 5 days", from: () => daysAgo(5), to: () => daysAgo(0) },
  { label: "Last 7 days", from: () => daysAgo(7), to: () => daysAgo(0) },
  { label: "Last 30 days", from: () => daysAgo(30), to: () => daysAgo(0) },
  { label: "Last 90 days", from: () => daysAgo(90), to: () => daysAgo(0) },
];

export default function DateRangePicker({
  from,
  to,
  onChange,
}: {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
}) {
  const today = ymd(new Date());
  const rangeDays = Math.round((new Date(`${to}T00:00:00Z`).getTime() - new Date(`${from}T00:00:00Z`).getTime()) / 86400000) + 1;
  const tooWide = rangeDays > MAX_RANGE_DAYS;
  const inverted = new Date(`${from}T00:00:00Z`).getTime() > new Date(`${to}T00:00:00Z`).getTime();

  const inputClass = "text-xs rounded-lg px-2.5 py-2 outline-none";
  const inputStyle = { background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text)" };

  return (
    <div className="mb-3">
      <div className="flex flex-wrap gap-2 items-center mb-2">
        {PRESETS.map((p) => {
          const active = from === p.from() && to === p.to();
          return (
            <button
              key={p.label}
              onClick={() => onChange(p.from(), p.to())}
              className={`tab-btn text-xs ${active ? "active" : ""}`}
            >
              {p.label}
            </button>
          );
        })}

        <div className="flex items-center gap-1.5 ml-auto text-xs text-[var(--text-soft)]">
          <span>From</span>
          <input
            type="date"
            value={from}
            max={today}
            onChange={(e) => onChange(e.target.value, to)}
            className={inputClass}
            style={inputStyle}
          />
          <span>to</span>
          <input
            type="date"
            value={to}
            max={today}
            onChange={(e) => onChange(from, e.target.value)}
            className={inputClass}
            style={inputStyle}
          />
        </div>
      </div>

      {inverted && (
        <p className="text-xs" style={{ color: "var(--accent)" }}>
          The start date is after the end date — pick an earlier start date.
        </p>
      )}
      {!inverted && tooWide && (
        <p className="text-xs" style={{ color: "var(--accent)" }}>
          That range is {rangeDays} days — please pick {MAX_RANGE_DAYS} days or fewer.
        </p>
      )}
    </div>
  );
}
