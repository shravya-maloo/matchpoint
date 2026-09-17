"use client";

import { CATEGORY_LABEL, type TournamentCategory } from "@/lib/tournamentCategory";

export type SortOption = { value: string; label: string };

export default function MatchFilters({
  tournaments,
  category,
  onCategoryChange,
  tournament,
  onTournamentChange,
  playerQuery,
  onPlayerQueryChange,
  sortField,
  onSortFieldChange,
  sortOptions,
  sortDir,
  onToggleSortDir,
}: {
  tournaments: string[];
  category: TournamentCategory | "all";
  onCategoryChange: (v: TournamentCategory | "all") => void;
  tournament: string;
  onTournamentChange: (v: string) => void;
  playerQuery: string;
  onPlayerQueryChange: (v: string) => void;
  sortField: string;
  onSortFieldChange: (v: string) => void;
  sortOptions: SortOption[];
  sortDir: "asc" | "desc";
  onToggleSortDir: () => void;
}) {
  const selectClass = "text-xs rounded-lg px-2.5 py-2 outline-none";
  const selectStyle = { background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text)" };

  return (
    <div className="flex flex-wrap gap-2 mb-4 items-center">
      <input
        value={playerQuery}
        onChange={(e) => onPlayerQueryChange(e.target.value)}
        placeholder="Filter by player…"
        className={`${selectClass} flex-1 min-w-[120px] sm:flex-initial`}
        style={selectStyle}
      />

      <select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value as TournamentCategory | "all")}
        className={selectClass}
        style={selectStyle}
      >
        <option value="all">All tournament types</option>
        <option value="grand_slam">{CATEGORY_LABEL.grand_slam}</option>
        <option value="masters">{CATEGORY_LABEL.masters}</option>
        <option value="other">{CATEGORY_LABEL.other}</option>
      </select>

      <select
        value={tournament}
        onChange={(e) => onTournamentChange(e.target.value)}
        className={selectClass}
        style={{ ...selectStyle, maxWidth: 200 }}
      >
        <option value="all">All tournaments</option>
        {tournaments.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      <div className="flex items-center gap-1 w-full sm:w-auto sm:ml-auto">
        <select
          value={sortField}
          onChange={(e) => onSortFieldChange(e.target.value)}
          className={`${selectClass} flex-1 sm:flex-initial`}
          style={selectStyle}
        >
          {sortOptions.map((o) => (
            <option key={o.value} value={o.value}>
              Sort: {o.label}
            </option>
          ))}
        </select>
        <button
          onClick={onToggleSortDir}
          className={selectClass}
          style={selectStyle}
          title={sortDir === "asc" ? "Ascending" : "Descending"}
        >
          {sortDir === "asc" ? "↑ Asc" : "↓ Desc"}
        </button>
      </div>
    </div>
  );
}
