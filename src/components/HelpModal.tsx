"use client";

const SECTIONS: { icon: string; title: string; body: string[] }[] = [
  {
    icon: "🔴",
    title: "Live",
    body: [
      "Matches currently in progress, both ATP and WTA, refreshing automatically every 25 seconds.",
      "A yellow dot next to a player's name means they're currently serving; hover it for a tooltip.",
      "Click anywhere on a match card to open a bigger detail view with player info, a larger score, a highlights link, and a fun fact.",
      "Use the filter bar to narrow by tournament type, a specific tournament, or a player's name, and sort by start time or how long a match has been on court.",
    ],
  },
  {
    icon: "📅",
    title: "Upcoming",
    body: ["Scheduled fixtures with date and time. Same filtering and click-to-expand as Live."],
  },
  {
    icon: "🏆",
    title: "Results",
    body: [
      "Completed matches. Use the date-range picker at the top (presets or a custom range, up to 90 days) to search further back than the default.",
      "Each match shows a 'total games played' figure as a rough sense of how long it went. The underlying data doesn't include an exact match duration, so this is an honest stand-in rather than a real clock time.",
      "The 📈 dots next to a player's name are their last-5 match form (green W, red L); hover for the exact record.",
      "↗ Share generates a link with a preview image you can post anywhere; the image is generated on the fly from that match's real result.",
      "▶ Watch highlights searches YouTube for that match. Where MatchPoint has real broadcaster info, you'll also see a direct link to where it aired.",
    ],
  },
  {
    icon: "👤",
    title: "Players",
    body: [
      "Search any player by name. You can also click a player's name anywhere else in the app, like a match card or the compare tool, to jump straight to their profile here.",
      "Profile shows current ranking (with a ▲/▼ movement arrow), age, playing hand, backhand style, recent form, and whatever season stats the data source has for that player.",
    ],
  },
  {
    icon: "⚖️",
    title: "Compare",
    body: [
      "Pick any two players to see a side-by-side comparison (ranking, points, country, hand, backhand) with the better value highlighted where that's meaningful.",
      "Below that, their head-to-head record and match list, but only within roughly the last 3 months, since the data source doesn't offer full career history.",
    ],
  },
  {
    icon: "⭐",
    title: "Fun facts",
    body: [
      "Matches involving a top-10 player or at a Grand Slam get a quick '⭐ Fun fact' button right on the card. Every match, marquee or not, also gets one automatically inside its detail view.",
    ],
  },
];

export default function HelpModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
      style={{ background: "rgba(5, 10, 16, 0.75)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card w-full max-w-xl max-h-[88vh] overflow-hidden flex flex-col"
        style={{ background: "var(--bg-elevated)" }}
      >
        <div
          className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 shrink-0"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <span className="headline text-sm">How MatchPoint works</span>
          <button onClick={onClose} className="text-[var(--text-soft)] hover:text-[var(--text)] text-lg" aria-label="Close">
            ✕
          </button>
        </div>

        <div className="px-4 sm:px-5 py-4 sm:py-5 flex flex-col gap-5 overflow-y-auto">
          <p className="text-sm text-[var(--text-soft)]">
            MatchPoint tracks live ATP &amp; WTA tennis. Here's what each tab does and where the less obvious features are hiding.
          </p>

          {SECTIONS.map((s) => (
            <div key={s.title}>
              <h3 className="text-sm font-bold flex items-center gap-2 mb-1.5">
                <span>{s.icon}</span>
                {s.title}
              </h3>
              <ul className="flex flex-col gap-1 text-sm text-[var(--text-soft)] list-disc pl-5">
                {s.body.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
          ))}

          <p className="text-xs text-[var(--text-soft)] pt-2" style={{ borderTop: "1px solid var(--border)" }}>
            Tip: the tennis balls drifting in the background will gently scatter if you move your cursor near them.
          </p>
        </div>
      </div>
    </div>
  );
}
