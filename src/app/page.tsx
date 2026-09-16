"use client";

import { useState } from "react";
import TennisBalls from "@/components/TennisBalls";
import ChatWidget from "@/components/ChatWidget";
import NewsTicker from "@/components/NewsTicker";
import LiveTab from "@/components/tabs/LiveTab";
import UpcomingTab from "@/components/tabs/UpcomingTab";
import ResultsTab from "@/components/tabs/ResultsTab";
import PlayersTab from "@/components/tabs/PlayersTab";

const TABS = [
  { key: "live", label: "Live" },
  { key: "upcoming", label: "Upcoming" },
  { key: "results", label: "Results" },
  { key: "players", label: "Players" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function Home() {
  const [tab, setTab] = useState<TabKey>("live");
  const [playerToOpen, setPlayerToOpen] = useState<string | null>(null);

  function goToPlayer(name: string) {
    setPlayerToOpen(name);
    setTab("players");
  }

  return (
    <>
      <TennisBalls />
      <NewsTicker />
      <main className="relative flex-1 flex flex-col items-center px-4 py-10 z-10">
        <header className="w-full max-w-5xl flex flex-col items-center text-center gap-2 mb-8">
          <h1 className="text-4xl sm:text-5xl">
            Match<span style={{ color: "var(--accent)" }}>Point</span>
          </h1>
          <p className="text-[var(--text-soft)] text-sm max-w-md">
            Live ATP &amp; WTA scores, fixtures, results, and players — all in one place.
          </p>
        </header>

        <nav className="w-full max-w-5xl flex flex-wrap justify-center gap-2 mb-8">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`tab-btn ${tab === t.key ? "active" : ""}`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <section className="w-full max-w-5xl">
          {tab === "live" && <LiveTab onPlayerClick={goToPlayer} />}
          {tab === "upcoming" && <UpcomingTab onPlayerClick={goToPlayer} />}
          {tab === "results" && <ResultsTab onPlayerClick={goToPlayer} />}
          {tab === "players" && (
            <PlayersTab
              initialQuery={playerToOpen}
              onConsumedInitialQuery={() => setPlayerToOpen(null)}
            />
          )}
        </section>
      </main>
      <ChatWidget />
    </>
  );
}
