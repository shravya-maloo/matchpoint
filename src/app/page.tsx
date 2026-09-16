"use client";

import { useState } from "react";
import TennisBalls from "@/components/TennisBalls";
import ChatWidget from "@/components/ChatWidget";
import NewsTicker from "@/components/NewsTicker";
import LiveTab from "@/components/tabs/LiveTab";
import UpcomingTab from "@/components/tabs/UpcomingTab";
import ResultsTab from "@/components/tabs/ResultsTab";
import PlayersTab from "@/components/tabs/PlayersTab";
import RankingsTab from "@/components/tabs/RankingsTab";

const TABS = [
  { key: "live", label: "Live" },
  { key: "upcoming", label: "Upcoming" },
  { key: "results", label: "Results" },
  { key: "players", label: "Players" },
  { key: "rankings", label: "Rankings" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function Home() {
  const [tab, setTab] = useState<TabKey>("live");

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
            Live ATP &amp; WTA scores, fixtures, results, players and rankings — all in one place.
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
          {tab === "live" && <LiveTab />}
          {tab === "upcoming" && <UpcomingTab />}
          {tab === "results" && <ResultsTab />}
          {tab === "players" && <PlayersTab />}
          {tab === "rankings" && <RankingsTab />}
        </section>
      </main>
      <ChatWidget />
    </>
  );
}
