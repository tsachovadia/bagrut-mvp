# HANDOFF.md — Cross-Tool Session Log

This file is the communication bridge between AI coding tools (Claude Code, Google Antigravity, etc.) working on this project.

## How to Use

**Before starting work**: Read the latest session entry to understand what was recently changed.
**After finishing work**: Add a new entry at the top of the Sessions list below.

Entry format:
```
### YYYY-MM-DD — [Tool Name]
**What was done**: Brief summary of changes
**Files changed**: Key files modified/created/deleted
**Key decisions**: Any architectural or design decisions made
**Open items**: Things left incomplete or for next session
```

---

## Sessions

### 2026-02-15 — Claude Code
**What was done**: Project cleanup and cross-tool workflow setup
**Files changed**:
- Deleted 9 junk files from root (che_probe_*, benchmark_results.md, data.csv, debug_keys.js, firebase-debug.log, duplicate package-lock)
- Deleted `repomix_exports/`
- Moved `missions/`, `market_intelligence/`, `research/` → `archive/`
- Moved `simulate-telegram*.sh` → `scripts/dev/`
- Updated `.gitignore` (added archive/, marketing/, *.csv, scripts/fb-data/)
- `git rm --cached` marketing/ and data files (still exist locally)
- Rewrote `CLAUDE.md` — now covers bot refactor, community clusters, admin CRM, all routes
- Created `.agent/rules/project-context.md` for Antigravity
- Created `HANDOFF.md` (this file)
**Key decisions**:
- CLAUDE.md is the single source of truth for architecture docs
- `.agent/rules/` mirrors key context for Antigravity
- HANDOFF.md is the cross-tool changelog both tools read/write
- marketing/ stays local but untracked in git (~94MB saved)
**Open items**: None

### 2026-02-15 — Google Antigravity
**What was done**: Community clusters, bot logic update, database seeding
**Files changed**:
- Created `api/lib/telegram/clusters.ts` (6 field-based clusters)
- Updated `api/lib/telegram/handlers/start.ts` (deep link routing for clusters)
- Added `supabase/migrations/20260216100000_seed_clusters.sql`
- Created `.npmrc`, updated `package.json` and `package-lock.json`
**Key decisions**:
- Programs mapped to 6 clusters instead of individual groups
- Bot routes users to cluster groups via deep links
**Open items**: Cluster invite links are placeholders — need real Telegram group links

### 2026-02-12 — Google Antigravity
**What was done**: Forum topics system, return-to-bot flow, bot identity-first refactor
**Files changed**:
- **Bot refactor**: Deleted `handlers/grades.ts`, `psychometric.ts`, `calculate.ts`, `programs.ts`, `api/lib/shared/calculator.ts`, `api/lib/shared/programs.ts`
- **New**: `api/lib/telegram/client.ts` (Telegram API + forum topics), `api/telegram-rooms.ts` (admin API)
- **Refactored**: `handlers/start.ts` (identity-first), `handlers/rooms.ts` (forum-based), `handlers/misc.ts`, `handlers/group-events.ts`
- **Forum DB**: `supabase/migrations/20260213130000_forum_topics.sql`
- **Return-to-bot**: `src/components/ReturnToBot.tsx`, rendered in App.tsx
- **New pages**: BlogPage, ArticlePage, CommunityPage, CollaborationsPage, ImportantDatesPage, WriteForUsPage
- **Admin overhaul**: New DashboardPage, PeoplePage, AdminCommunityPage. Deleted ShadowDashboard, SignalsPage, AdminDashboard
- **New components**: CommunityHero, TelegramCTA, SmartArticleLayout, ExpertCard, UserProfilePanel, JourneyStageFlow
- **New hooks**: useUnifiedPeople, usePartners
- **New data**: src/data/articles.ts
- **New routes**: /blog, /community, /collaborations, /open-days, /write-for-us
**Key decisions**:
- Bot is now identity-first — no in-bot data entry, users go to web
- One forum supergroup with topics instead of many groups
- Admin CRM rebuilt from scratch (ShadowNet)
- Content marketing pages added for SEO/community
**Open items**:
- Blog content is placeholder/minimal
- Partner billing system (api/admin/partner-billing.ts) exists but may not be wired up
- `vite-local-api.ts` proxies API locally — large file, could use cleanup
