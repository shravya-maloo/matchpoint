# 🎾 MatchPoint

Live ATP & WTA tennis — live scores, upcoming fixtures, recent results, player profiles, and rankings, all in one place. Includes a rule-based chatbot and fun facts on marquee matches.

## Features

- **Live** — matches in progress right now, both tours, auto-refreshing, with start time and time-on-court
- **Upcoming** — scheduled fixtures with date/time
- **Results** — recently completed matches with date and a "total games" length indicator, plus links to watch and a highlights search
- **Players** — search any player, or click a player's name anywhere in the app (Live/Upcoming/Results cards, or the match detail view) to jump straight to their profile. Profile shows ranking, ranking points and movement (▲/▼), age, plays (hand), backhand style, birthday, plus whatever ratings/season stats the API returns for that player
- **Rankings** — ATP & WTA top 100
- 📺 **Watch links** on every match: known broadcasters (ESPN+, Tennis Channel, Sky Sports, etc.) link to their real homepage; anything else falls back to a live-stream search link
- 🔎 **Filters & sorting** on Live/Upcoming/Results: filter by tournament type (Grand Slam / Masters / Tour), a specific tournament, or a player name; sort by date or match length, ascending or descending
- 📰 **Live updates ticker** scrolling at the top of the page
- 🎾 **Click any match** to open a detail view: player avatars, a bigger set-by-set score (plus the live point score), a highlights link, and a fun fact — shown for every match, not just marquee ones
- ⭐ **Fun facts** on marquee matches (top-10 players or Grand Slam events) get a quick-access button right on the card; every match gets one in its detail view
- 💬 **Chatbot** — rule-based assistant covering live scores, upcoming fixtures, rankings, player lookups, and a broad tennis glossary (deuce, tiebreak, fault, bagel, walkover, seeding, and more) — no LLM/API key required
- Interactive floating tennis balls in the background — they drift on their own and gently scatter away from your cursor

## Data sources

- **[Live Tennis API](https://livetennisapi.com)** (free tier) — live matches, fixtures, player search/profiles. Official `livetennisapi` npm client.
- **ESPN's public tennis endpoints** (no key needed) — recent results and rankings. Undocumented/unofficial, so treat as best-effort.
- All external calls are cached in Postgres (`src/lib/cache.ts`) and shared across every visitor — important because the free Live Tennis API tier caps out at 100 requests/day total.

## Getting started

1. Create a Postgres database (e.g. a free [Neon](https://neon.tech) project).
2. Get a free Live Tennis API key (no card) at [livetennisapi.com/subscribe/free](https://livetennisapi.com/subscribe/free).
3. Copy `.env.example` to `.env.local` and fill in `DATABASE_URL` and `LIVETENNISAPI_KEY`.
4. `npm install && npm run dev`, open [http://localhost:3000](http://localhost:3000).

### Deploying (Vercel)

Add `DATABASE_URL` and `LIVETENNISAPI_KEY` as environment variables in the Vercel project, then deploy.

## Project structure

```
src/
  app/
    page.tsx                  # Tab navigation + layout
    api/live/                  # Live matches (Live Tennis API)
    api/upcoming/                # Fixtures (Live Tennis API)
    api/results/                   # Recent results (ESPN)
    api/rankings/                    # ATP/WTA rankings (ESPN)
    api/players/search, /[id]/         # Player search + profile (Live Tennis API)
    api/funfact/                          # Curated fact lookup + generic fallback
    api/chat/                              # Rule-based chatbot
  components/
    tabs/                       # One component per tab
    TennisBalls.tsx              # Decorative floating balls
    ChatWidget.tsx                 # Floating chat panel
    FunFactButton.tsx                # Shown only on marquee matches
  lib/
    tennis.ts                    # Live Tennis API wrapper (cached)
    espn.ts                        # ESPN results + rankings (cached)
    cache.ts                         # Shared Postgres cache, TTL-based
    chatbot.ts                         # Rule-based Q&A logic
    funfacts.ts                          # Curated-first, generic-fallback lookup
    marquee.ts                             # "Is this match marquee?" rule
    format.ts                                # Score formatting helpers
  db/
    schema.ts                    # api_cache + fun_facts tables
    index.ts                       # Postgres connection + auto-migration
```

## Known gaps / things to verify after deploying

- **Rankings** use ESPN's undocumented core API. Fixed one confirmed bug (its `$ref` links pointed at an internal `.pvt` domain that isn't publicly reachable — rewritten to `.com`), and made the list-parsing defensive against a few plausible response shapes, but the exact shape still hasn't been checked against a real response — if it's still empty, the error message now returned will say which shape assumption failed, which should make it a quick fix.
- **"Unknown" player names in Results**: ESPN sometimes omits the structured athlete object (common in qualifying rounds, retired players, or ones not yet in ESPN's roster) but always includes a free-text summary like "Fearnley (GBR) bt Carballes Baena (ESP) 7-6 6-3". Fixed by parsing names out of that summary as a fallback — verified against several real examples, but ESPN's summary format could vary in ways not seen in testing.
- **Watch links**: only real broadcaster data comes from ESPN's Results (a small hardcoded list of known broadcasters maps to their real homepage; anything else gets a Google search link). Live and Upcoming have no broadcaster data at all from the Live Tennis API, so those always get a generic "find a live stream" search link, not a guaranteed direct source.
- **Fun facts** ship with only a generic trivia pool — no curated per-player/tournament facts are seeded into the `fun_facts` table yet. Add rows there (subject_type: `player` | `tournament`, subject, fact) to have marquee matches surface something more specific.
- **Player photos**: neither data source provides headshots, so player "faces" in the match detail view are colored initials avatars, not real photos.
- **Match duration**: neither data source provides a true duration field. Live matches show genuine elapsed time (now minus the match's scheduled start). Completed matches (Results) instead show "total games played" as an honest, derivable proxy for match length — it's labeled as such rather than presented as a real duration.
- The Live Tennis API free tier doesn't include completed-match history, so Results comes entirely from ESPN instead.
