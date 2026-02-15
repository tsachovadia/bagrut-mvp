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

### 2026-02-15 — Claude Code (Session 7, SEO)
**What was done**: Added SEO meta tags and HelmetProvider to all key pages. Fixed index.html for Hebrew SEO.
**Files changed**:
- **`index.html`** — `lang="en"` → `lang="he" dir="rtl"`, added meta description, og tags (title, description, image, url, locale), twitter card, canonical URL, keywords
- **`src/main.tsx`** — Wrapped app with `HelmetProvider` (was local per-component)
- **`src/components/blog/SmartArticleLayout.tsx`** — Removed local `HelmetProvider` (now at root), added og:title, og:description, og:image, canonical URL per article
- **`src/pages/HomePage.tsx`** — Added Helmet with title, description, canonical
- **`src/pages/ImportantDatesPage.tsx`** — Added Helmet targeting "ימים פתוחים 2026" keyword
- **`src/pages/BlogPage.tsx`** — Added Helmet with title, description, canonical
**Key decisions**:
- og:image uses `https://mitlabtim.co.il/logo_new.png` (default) and article images (per article)
- Canonical URLs all point to `mitlabtim.co.il` domain
- HelmetProvider at root level so all pages can use Helmet without wrapping
**Open items**:
- Need a proper og:image (1200x630 social share card) instead of logo
- robots.txt / sitemap.xml for Google indexing
- Sprint 2 remaining: GroupLead integration, first 100 users

### 2026-02-15 — Claude Code (Session 6, Sprint 2 Start)
**What was done**: Connected lead capture forms to Supabase and rebuilt the /open-days page as a monetization asset.
**Files changed**:
- **`src/components/Footer.tsx`** — Footer lead form now inserts to Supabase `soft_leads` table (was localStorage-only). Fields: phone, email, source=`footer_form`, interest=`general`
- **`src/pages/ImportantDatesPage.tsx`** — Complete rewrite:
  - 15 real events: 10 open days (TAU, Ariel, Technion×2, BIU×2, BGU, HUJI×2, Reichman), 2 psychometric, 3 registration deadlines
  - 4 event types with color-coded filter buttons (ימים פתוחים, פסיכומטרי, בגרויות, מועדי הרשמה)
  - Grouped by month with collapsible sections
  - Countdown badges (בעוד X ימים, מחר!, היום!)
  - "הזכירו לי" button per event → phone input → saves to `soft_leads` (source=`open_days_reminder`)
  - "לאתר המוסד" links with GTM tracking (`open_day_click` event — tracks institution + type)
  - Search across title, description, institution
  - Auto-hides past events
  - Bottom CTA: calculator + Telegram community
  - "עודכן פברואר 2026" badge + source disclaimer
**Key decisions**:
- Every "לאתר המוסד" click fires `open_day_click` GTM event — data for future monetization (show colleges their click volume)
- "הזכירו לי" saves to `soft_leads` with interest=`reminder_{eventId}` — can filter by event for targeted outreach
- Added `registration` event type (deadline tracking) alongside existing types
- Past events auto-hidden (no manual cleanup needed)
**Open items**:
- Sprint 2 remaining: GroupLead integration, first 100 users
- Actual reminder sending (cron/SMS) not implemented — currently just captures the lead
- Open days data is static — could move to Supabase for admin editing later

### 2026-02-15 — Claude Code (Session 5, UX Feedback Round)
**What was done**: Implemented 10 UX feedback items across blog articles and homepage.
**Files changed**:
- **`src/data/articles.ts`** — DiceBear avatar: `avataaars` (scary) → `micah` with `mouth=laughing` (friendly). Open days article rewritten: info-focused, links to `/open-days` page, "last updated" banner
- **`src/components/blog/SmartArticleLayout.tsx`** — Added `remark-gfm` for markdown table rendering with styled components (rounded borders, purple headers, hover rows). Share section → WhatsApp/Facebook/Copy Link buttons. FAB moved from `left-6` to `right-6` (no longer overlaps accessibility widget)
- **`src/components/marketing/ConversationalHero.tsx`** — AI scan CTA redesigned as dashed-border drop zone: "גררו לכאן תמונה של גיליון הציונים" with upload icon
- **`src/components/marketing/ValuePropositionSection.tsx`** — Features carousel → 4-column photo grid with Unsplash images. Added scrolling university logos marquee (14 institutions). Community section: vertical list → compact 3-column grid with "50,000+ בקהילה" badge
- **`src/components/Footer.tsx`** — Added "השאירו פרטים ונחזור אליכם" lead capture form (phone + email → localStorage + GTM event `footer_lead_submit`)
- **`tailwind.config.js`** — Full brand-purple scale (50-900), brand-green shades (400, 500), `animate-marquee` keyframe
- **`package.json`** — Added `remark-gfm` dependency
**Key decisions**:
- FAB buttons go on RIGHT side (RTL) to avoid accessibility widget on LEFT
- Share section uses WhatsApp + Facebook direct share URLs (no Instagram — not supported for web share)
- Footer lead form stores to localStorage (no Supabase call yet — needs backend endpoint)
- University logos marquee uses CSS animation, not JS
**Open items**:
- Footer lead form needs Supabase `soft_leads` insert (currently localStorage only)
- Consider drag-and-drop file handling on the hero drop zone (currently just opens wizard)
- Sprint 2 next: GroupLead integration, open days page, first 100 users

### 2026-02-15 — Claude Code (Session 4, Sprint 1 — COMPLETE)
**What was done**: Completed all Sprint 1 tasks — homepage redesign, broken links fix, GTM analytics, domain cleanup, real blog articles.
**Files changed**:
- **`src/components/marketing/ConversationalHero.tsx`** — Major rewrite: removed animated blobs + 4 redundant quick-link cards, new clean hero with animated stat counters (50K+, 500+, 7+), 2 CTAs (AI scan + manual), trust microcopy
- **`src/components/marketing/ValuePropositionSection.tsx`** — Removed 5 fake testimonials, fake channel counts, broken WhatsApp link. Kept features carousel + Telegram community
- **`src/components/marketing/SmartWelcomeModal.tsx`** — Updated social proof badge: "50,000+ תלמידים בקהילה"
- **`src/components/Footer.tsx`** — Copyright 2025→2026, removed broken WhatsApp, debug button wrapped with `!isProduction`
- **`src/pages/WriteForUsPage.tsx`** — Placeholder Google Forms → Telegram bot; "Launch Pad" → "מתלבטים"
- **`src/components/UniversityResultsTable.tsx`** — Expired WhatsApp group → Telegram community CTA
- **`src/components/blog/ExpertCard.tsx`** — Fake wa.me → Telegram bot
- **`src/components/blog/SmartArticleLayout.tsx`** — Fake wa.me FAB → Telegram bot
- **`src/components/BagrutForm.tsx`** — Added `grade_entered` GTM event
- **`src/App.tsx`** — Added `sekem_calculated` GTM event
- **`src/pages/ProgramPage.tsx`** — Added `program_viewed` GTM event
- **`src/utils/gtm.ts`** — Fixed GTM fallback: `GTM-placeholder` → `GTM-526PQ28M` (real ID from vite.config.ts)
- **`src/pages/CollaborationsPage.tsx`** — "Launch Pad" → "מתלבטים"; `contact@launchpad.co.il` → `contact@mitlabtim.co.il`
- **`src/data/articles.ts`** — Complete rewrite: 4 real articles with images, references, conversion CTAs. Team name "Launch Pad" → "מתלבטים". New articles: "איך לחשב ממוצע בגרות" (drives to calculator), "הפסיכומטרי 2026" (comprehensive guide), plus enhanced versions of dilemma + open days articles
- **`src/pages/BlogPage.tsx`** — Added article image display in blog grid cards
- **`src/hooks/useAnimatedCounter.ts`** — New hook for animated number display
**Key decisions**:
- **Domain**: `mitlabtim.co.il` is canonical. All `launchpad.co.il` references replaced
- **Brand name**: "מתלבטים" (Hebrew) everywhere. "Launch Pad" fully removed from user-facing text
- **GTM ID**: `GTM-526PQ28M` found in vite.config.ts, set as fallback in gtm.ts
- **Blog strategy**: 4 articles targeting key SEO terms (ממוצע בגרות, פסיכומטרי 2026, ימים פתוחים, בחירת תואר). Each article has embedded CTAs linking to calculator (/), programs (/programs), and community (t.me/MitlabtimBot). All articles cite real sources (NITE, CHE, university admission sites, CBS)
- **Article IDs changed**: Old articles removed (starting-late, student-finance). New IDs: `how-to-calculate-bagrut-average-2026`, `psychometric-guide-2026`, `degree-dating-psychology-vs-engineering`, `open-days-2026-guide`
**Open items**:
- UX/UI State Notion page still needs update
- User needs to provide real WhatsApp group link (currently all WhatsApp links route to Telegram)
- Old article URLs will 404 if anyone bookmarked them (low risk — blog was placeholder)
- Sprint 2 next: GroupLead integration, open days page, first 100 users

### 2026-02-15 — Claude Code (Session 3)
**What was done**: Set up Notion as source of truth for planning. Created Product Backlog database with 20 prioritized tasks. Defined cross-tool workflow.
**Files changed**:
- Created **Notion Product Backlog** database (data source: `12fa2e47-c9e1-4640-b47b-e3b8974f29ed`) inside project page
- Updated `.agent/rules/project-context.md` — added Notion workflow section with IDs and rules
- Deleted `docs/BACKLOG.md` — replaced by Notion database
**Key decisions**:
- **Notion = source of truth for planning** (tasks, CRM, UX/UI docs). Both Claude Code and Antigravity read/write via Notion MCP.
- **Code = source of truth for implementation** (overrides Notion if conflict)
- **HANDOFF.md stays** as session-to-session bridge
- **Backlog schema**: משימה, קטגוריה (7), עדיפות (P0-P3), מאמץ (S/M/L/XL), השפעה, סטטוס, מקור, הערות, תאריך יעד
- **Sprint 1 tasks** (marked "Sprint" in Notion): דף הבית redesign, כתבות אמיתיות, GTM events, תיקון לינקים, UX/UI State update
- **Existing Notion CRM** (data source: `d0eb8892-85db-46c8-930b-b3343c55ad13`) is excellent — use it for sales tracking
- **User pays for cursor $60/mo + base44 $50/mo** — may not need these if using Claude Code
**Open items**:
- UX/UI State Notion page needs full update to match current codebase
- Sprint 1 not started yet — user decides when to begin
- Notion CRM is empty — needs to be populated when sales calls start

### 2026-02-15 — Claude Code (Session 2)
**What was done**: Strategic planning session — business goals, prioritization, and operational framework
**Files changed**:
- Created `docs/BACKLOG.md` (later deleted — replaced by Notion database)
**Key decisions**:
- **Goal**: First paying customer (college/university) buying qualified leads
- **Sprint format**: 1-week sprints, 3 tasks max, Sunday planning / Friday review
- **3 sprint plan**:
  - Sprint 1: Fix homepage + articles + GTM events (product looks professional)
  - Sprint 2: GroupLead integration + open days page + first 100 users
  - Sprint 3: Client Portal redesign + pitch deck + 5 sales calls to colleges
- **Lead pricing research**: Tier 3 leads (with real grades + consent) worth 200-700₪ per lead in Israeli market
- **Target institutions for pilot**: Reichman, Ono, Sapir, Ariel, MTA (colleges are more aggressive than universities)
- **Pilot strategy**: 50 free leads → track conversion → pricing conversation
- **Analytics**: Stay with GTM, add specific events (grade_entered, sekem_calculated, program_viewed)
- **Metrics**: North Star = students who entered grades and viewed results; Activation Rate = % visitors who enter 3+ grades; Leads Generated = qualified leads with consent
- **Feb-April is peak window** (university registration season) — urgency to ship
**Research findings**:
- GroupLead data analysis: 571 FB group members, 160 valid emails, 28% "don't know what to study", top interests: psychology, CS, law, engineering, business
- Solo founder best practice: 30% dev, 30% marketing, 20% sales, 10% content, 10% planning
- Boris Cherny (Claude Code creator) workflow: Plan mode first, parallel sessions, CLAUDE.md as institutional memory
**Open items**:
- User has more brainstorming to share — BACKLOG.md is the dump zone
- Sprint 1 not yet started — need user approval to begin
- GroupLead Google Sheet integration needs technical design
- GitHub Projects board not yet created
- Client Portal needs full re-spec based on what colleges actually want to see

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
