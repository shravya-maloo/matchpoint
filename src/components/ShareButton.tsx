"use client";

import { useState } from "react";
import { encodeShareData, formatSetScore, type ShareMatchData } from "@/lib/shareCard";

export default function ShareButton({ data, className }: { data: ShareMatchData; className?: string }) {
  const [copied, setCopied] = useState(false);

  function buildUrl() {
    const encoded = encodeShareData(data);
    return `${window.location.origin}/share/${encoded}`;
  }

  async function share() {
    const url = buildUrl();
    const winnerName = data.w === 1 ? data.p1 : data.w === 2 ? data.p2 : null;
    const loserName = data.w === 1 ? data.p2 : data.w === 2 ? data.p1 : null;
    const text =
      winnerName && loserName
        ? `${winnerName} def. ${loserName} ${formatSetScore(data.s1, data.s2)} · ${data.tn}`
        : `${data.p1} vs ${data.p2} · ${data.tn}`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "MatchPoint", text, url });
        return;
      } catch {
        // user cancelled the native share sheet, or it's unavailable; fall through to copy
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard blocked; nothing more we can do without a visible fallback UI
    }
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        share();
      }}
      className={className ?? "text-xs font-semibold inline-block"}
      style={{ color: "var(--accent)" }}
    >
      {copied ? "✓ Link copied" : "↗ Share"}
    </button>
  );
}
