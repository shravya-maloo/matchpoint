# 🎾 MatchPoint

Live ATP & WTA tennis — live scores, upcoming fixtures, recent results, player profiles, and rankings, all in one place. Includes a rule-based chatbot and fun facts on marquee matches.

## Features

- **Live** — matches in progress right now, both tours, auto-refreshing
- **Upcoming** — scheduled fixtures
- **Results** — recently completed matches with a link to search highlights on YouTube
- **Players** — search any player, see ranking, hand, backhand style
- **Rankings** — ATP & WTA top 100
- ⭐ **Fun facts** on marquee matches (top-10 players or Grand Slam events) — curated facts first, general tennis trivia as fallback
- 💬 **Chatbot** — rule-based assistant that can answer live-match questions, top rankings, and tennis terminology (deuce, tiebreak, break point, etc.) — no LLM/API key required
- Floating tennis-ball decoration, professional dark sports-broadcast theme

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

- **Rankings** use ESPN's undocumented core API, which returns a paged list of `$ref` links rather than embedded data — `src/lib/espn.ts` resolves each ref in small batches. This endpoint's exact shape was not verified against a live response before shipping (the environment this was built in couldn't reach espn.com), so it's the most likely place to need a follow-up fix.
- **Fun facts** ship with only a generic trivia pool — no curated per-player/tournament facts are seeded into the `fun_facts` table yet. Add rows there (subject_type: `player` | `tournament`, subject, fact) to have marquee matches surface something more specific.
- The Live Tennis API free tier doesn't include completed-match history, so Results comes entirely from ESPN instead.
