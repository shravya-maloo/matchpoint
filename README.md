# 🎾 MatchPoint

Live ATP & WTA tennis: live scores, upcoming fixtures, recent results, player profiles, and head-to-head comparisons, all in one place. Built with real data from two free sources, a shared server-side cache to stay within a tight API quota, and no fake or placeholder data anywhere.

Access it here: https://matchpoint-beige-six.vercel.app/

## Features

### Live
Matches currently in progress, both tours, refreshing automatically every 25 seconds.
- A yellow dot next to a player's name means they're currently serving; hover it for a tooltip.
- Click any match card to open a detail view: player avatars, a bigger set-by-set score, the current point score, a highlights search link, a "where to watch" link, and a fun fact.
- Filter by tournament type (Grand Slam / Masters / Tour), a specific tournament, or a player's name. Sort by start time or how long a match has been on court, ascending or descending.

### Upcoming
Scheduled fixtures with date and time. Same filtering, sorting, and click-to-expand as Live.

### Results
Completed matches, with real tools for finding the one you want:
- **Date-range search**: presets (last 5/7/30/90 days) or a custom range, up to 90 days back.
- **Form indicator**: a row of last-5 win/loss dots next to each player's name (green W, red L), fetched in a single batched request for the whole page rather than one call per player.
- **Share**: generates a link with a rendered preview image (an OG image built from that match's real score, not a generic template) that you can post anywhere.
- **Watch & highlights**: highlights search across two real entry points (YouTube, and a Google video search that often surfaces the exact streaming app directly), plus a real broadcaster link where MatchPoint has that data.
- Shows a "total games played" figure next to each match as an honest stand-in for match length; see [Known limitations](#known-limitations) for why it isn't a real duration.

### Players
Search any player by name, or click a player's name anywhere else in the app (a match card, the Compare tool) to jump straight here. The profile shows:
- Current ranking, with a movement indicator (up, down, or unchanged)
- Age (computed from birthday), country, playing hand, backhand style
- Recent form (last 5 matches)
- Whatever ratings/season stats the data source has for that player, rendered generically since that part of the API is unstructured

### Compare
Pick any two players for a side-by-side stat comparison (ranking, points, country, hand, backhand), with the better value highlighted where that's meaningful, plus their head-to-head record and match list within roughly the last 3 months.

### Fun facts
Matches involving a top-10 player or a Grand Slam get a quick "Fun fact" button right on the card. Every match, marquee or not, also gets one automatically inside its detail view: a curated fact if one's been added for that player or tournament, otherwise a fact from a general tennis-trivia pool.

### Help guide
An info button in the header opens a full walkthrough of every tab and feature, including the ones that are easy to miss.

### Design
A dark, sports-broadcast-style theme with a chartreuse accent, an animated tab bar (the active tab's highlight slides between tabs), hand-crafted organic blob backgrounds, and tennis balls that drift on their own and scatter away from your cursor. Fully responsive, tested down to a 375px mobile viewport.

## Data sources

- **[Live Tennis API](https://livetennisapi.com)** (free tier, via the official `livetennisapi` npm client) powers Live, Upcoming, and Player search/profiles.
- **ESPN's public tennis endpoints** (no key needed, unofficial and undocumented) power Results. The free Live Tennis API tier doesn't include completed-match history, so Results comes from ESPN instead.
- **A shared Postgres cache** sits in front of both. The Live Tennis API's free tier caps out at 100 requests/day total across every visitor, so every read goes through a TTL-based cache table first; one visitor's request warms it for everyone until it expires. See `src/lib/cache.ts`.


## Project structure

```
src/
  app/
    page.tsx                       # Tab navigation, header, background layers
    api/
      live/                          # Live matches (Live Tennis API)
      upcoming/                        # Fixtures (Live Tennis API)
      results/                           # Completed matches, date-range aware (ESPN)
      players/search, /[id]/               # Player search + profile (Live Tennis API)
      players/form-batch/                     # Batched last-5 form lookup
      head-to-head/                              # Recent head-to-head between two named players
      funfact/                                     # Curated fact lookup + generic fallback
    share/[data]/                                    # Public share page + generated OG image
  components/
    tabs/                             # LiveTab, UpcomingTab, ResultsTab, PlayersTab, CompareTab
    MatchDetailModal.tsx                # The expanded match view opened from any card
    MatchFilters.tsx                      # Shared filter/sort bar
    DateRangePicker.tsx                     # Results' date-range control
    FormIndicator.tsx                         # Last-5 W/L dots
    FunFactButton.tsx                           # Quick-access fact button on marquee matches
    ShareButton.tsx                               # Share-link + native share sheet
    PlayerAvatar.tsx                                # Initials avatar (no real photos available)
    HelpModal.tsx                                     # The info-button walkthrough
    TennisBalls.tsx, HaikeiBackground.tsx               # Decorative background layers
    NewsTicker.tsx                                        # Scrolling live-updates banner
  lib/
    tennis.ts                          # Live Tennis API wrapper, cached
    espn.ts                              # ESPN results, cached; also has the name-recovery
                                            # fallback for matches missing structured player data
    cache.ts                               # Shared Postgres TTL cache
    form.ts, headtohead.ts                   # Derived stats from the same results data
    funfacts.ts                                # Curated-first, generic-fallback fact lookup
    marquee.ts                                   # "Is this match marquee?" rule
    tournamentCategory.ts                          # Grand Slam / Masters / Tour heuristic
    watch.ts                                         # Known-broadcaster links + search fallback
    dates.ts, format.ts                                # Date/score formatting helpers
    shareCard.ts                                         # Encodes/decodes match data into a share URL
  db/
    schema.ts                          # api_cache + fun_facts tables
    index.ts                             # Postgres connection + auto-migration on boot
```
