"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import TennisBalls from "@/components/TennisBalls";
import HaikeiBackground from "@/components/HaikeiBackground";
import NewsTicker from "@/components/NewsTicker";
import LiveTab from "@/components/tabs/LiveTab";
import UpcomingTab from "@/components/tabs/UpcomingTab";
import ResultsTab from "@/components/tabs/ResultsTab";
import PlayersTab from "@/components/tabs/PlayersTab";
import CompareTab from "@/components/tabs/CompareTab";
import HelpModal from "@/components/HelpModal";

const TABS = [
  { key: "live", label: "Live" },
  { key: "upcoming", label: "Upcoming" },
  { key: "results", label: "Results" },
  { key: "players", label: "Players" },
  { key: "compare", label: "Compare" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function Home() {
  const [tab, setTab] = useState<TabKey>("live");
  const [playerToOpen, setPlayerToOpen] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  function goToPlayer(name: string) {
    setPlayerToOpen(name);
    setTab("players");
  }

  return (
    <>
      <HaikeiBackground />
      <TennisBalls />
      <NewsTicker />
      <main className="relative flex-1 flex flex-col items-center px-4 py-10 z-10">
        <header className="w-full max-w-5xl flex flex-col items-center text-center gap-2 mb-8 relative">
          <button
            onClick={() => setShowHelp(true)}
            aria-label="How MatchPoint works"
            title="How MatchPoint works"
            className="absolute top-0 right-0 w-9 h-9 rounded-full grid place-items-center text-base font-bold"
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--accent)" }}
          >
            ⓘ
          </button>
          <h1 className="text-4xl sm:text-5xl">
            Match<span style={{ color: "var(--accent)" }}>Point</span>
          </h1>
          <p className="text-[var(--text-soft)] text-sm max-w-md">
            Live ATP &amp; WTA scores, fixtures, results, and players — all in one place.
          </p>
        </header>

        <nav className="w-full max-w-5xl flex justify-start sm:justify-center gap-2 mb-8 overflow-x-auto no-scrollbar px-1 -mx-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`tab-btn relative shrink-0 ${tab === t.key ? "active" : ""}`}
              style={tab === t.key ? { background: "transparent", color: "#0a1420" } : undefined}
            >
              {tab === t.key && (
                <motion.span
                  layoutId="tab-pill"
                  className="absolute inset-0 rounded-full"
                  style={{ background: "var(--accent)", zIndex: -1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              {t.label}
            </button>
          ))}
        </nav>

        <section className="w-full max-w-5xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              {tab === "live" && <LiveTab onPlayerClick={goToPlayer} />}
              {tab === "upcoming" && <UpcomingTab onPlayerClick={goToPlayer} />}
              {tab === "results" && <ResultsTab onPlayerClick={goToPlayer} />}
              {tab === "players" && (
                <PlayersTab
                  initialQuery={playerToOpen}
                  onConsumedInitialQuery={() => setPlayerToOpen(null)}
                />
              )}
              {tab === "compare" && <CompareTab />}
            </motion.div>
          </AnimatePresence>
        </section>
      </main>

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </>
  );
}
