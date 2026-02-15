# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Cross-tool workflow**: This project is developed with both Claude Code and Google Antigravity. Before starting work, read `HANDOFF.md` for recent changes. After finishing work, update `HANDOFF.md` with what you did.

## Project Overview

Israeli Bagrut (high school) grade calculator and university admission simulator. Students enter grades, get weighted averages with university-specific bonuses, and see admission eligibility across programs. Includes a Telegram bot for community routing, an admin CRM ("ShadowNet") for lead management, and content marketing pages. All UI is in Hebrew with RTL layout.

## Commands

- `npm run dev` — Start dev server (localhost:5173)
- `npm run build` — TypeScript check + Vite production build
- `npm run lint` — ESLint
- `npm run preview` — Preview production build locally

No test runner is configured.

## Tech Stack

React 19 + TypeScript + Vite 7 + Tailwind CSS 3.4. Supabase for auth (Google OAuth) and Postgres DB. Vercel for deployment (serverless functions in `api/`). Framer Motion for animations. Path alias: `@/*` → `./src/*`.

## Architecture

### State Management

No Redux/Zustand — state lives in `App.tsx` and flows down via props:
- `bagrutGrades: SubjectGrade[]`, `psychometric: PsychometricScores`, `preferences`, `results`
- `TrackedDegreesContext` is the only React Context (for saved programs)
- Persistence: localStorage (`bagrut_plus_data`) with debounced Supabase sync via `lib/userData.ts`

### Calculation Engine (core domain logic)

The pipeline: user grades → `calculator.ts` (weighted average + bonus math) → `bonuses.ts` (university-specific formulas) → `sekem.ts` (admission score) → `admission-evaluation.ts` (evaluate program logic rules). Orchestrated by `calculation-bridge.ts`.

Key formulas:
- Bagrut bonuses: Math 5-unit +35, English 5-unit +25, Physics 5-unit +25, generic 5-unit +20
- Sekem (admission score) varies by institution: Technion uses `0.5×Bagrut + 0.075×Psychometric - 18`, TAU uses `((Bagrut×4) + Psychometric) / 2 + 30`

Programs have nested logic rules (AND/OR trees of conditions on sekhem, psychometric, specific subjects). Evaluated in `admission-evaluation.ts`.

### Student Sectors

`mamlachti` (state), `mamlachti_dati` (state-religious), `arab`, `druze` — each has different mandatory subjects defined in `subjects.ts`.

### Data Flow

1. User inputs grades in BagrutForm/Wizard
2. `onDataUpdate` → App.tsx state → `saveUserData()` → localStorage + Supabase
3. `useEffect` recalculates via `calculateAdmissionStats()`
4. Results flow to Dashboard panels (MyDataPanel, PlaygroundPanel, TargetsPanel)

### Backend (api/)

Vercel serverless functions: `extract-grades.ts` (OCR via Google Vision), `send-email.ts` (Resend), webhook handlers, cron jobs.

### Telegram Bot (Identity-First Architecture)

Bot: @MitlabtimBot — a lightweight routing layer that pushes users to the web app.

**Philosophy**: Bot collects minimal identity (sector), then redirects to web for data entry. No more in-bot grade entry or calculations.

Key files:
- Webhook router: `api/telegram-webhook.ts`
- Handlers: `api/lib/telegram/handlers/` — start, rooms, misc, callback-router, consent, group-events
- Client API: `api/lib/telegram/client.ts` (Telegram API wrapper + forum topic management)
- Clusters: `api/lib/telegram/clusters.ts` (program → field cluster mapping)
- Types: `api/lib/telegram/types.ts`
- Rooms API: `api/telegram-rooms.ts` (admin actions for forum topics)
- Middleware: `api/lib/telegram/middleware.ts` (verify, resolveUser, touchUser, logMessage)

**Bot flows**:
- `/start` → asks sector → CTA to website
- `/start program_{id}` → deep link from program page → routes to relevant cluster group
- `/start link_{token}` → token-based web-to-bot account linking
- `/start return` → return from website, shows main menu
- `/rooms` → shows forum-based community with smart recommendations

**Deleted handlers** (data entry moved to web): grades.ts, psychometric.ts, calculate.ts, programs.ts

### Community System (Clusters + Forum Topics)

Programs are grouped into 6 field-based clusters: `tech`, `med`, `law`, `mind`, `business`, `design`. Each cluster maps to a Telegram group. Defined in `api/lib/telegram/clusters.ts`.

Forum topics allow organized discussions within one supergroup. DB schema: `bot_groups.is_forum`, `forum_topic_id`, `parent_group_id`.

### Unified Profile System

- `profile_links` table links bot identity to web identity
- `unified_profiles` VIEW: FULL OUTER JOIN of `user_profiles` + `bot_users`
- Services: `api/lib/profile-linking.ts`, `api/lib/gap-analysis.ts`, `api/lib/lead-routing.ts`
- Consent: progressive tiers in `src/lib/consent.ts`

### Routing

React Router v7 in `App.tsx`. Routes:

**Public**:
- `/` — calculator (HomePage)
- `/programs` — program search (ProgramsExplorer)
- `/program/:id` — program details
- `/dashboard` — simulator (UnifiedDashboard)
- `/tracking` — saved programs
- `/blog`, `/blog/:id` — blog articles
- `/community` — community landing page
- `/collaborations` — partnerships page
- `/open-days` — important dates
- `/write-for-us` — content contributor page
- `/client-portal` — client demo portal (token-gated)

**Admin** (dev only, blocked in production via `isProduction`):
- `/admin/shadow` — dashboard (KPIs, funnel, segments)
- `/admin/shadow/people` — unified user management
- `/admin/shadow/community` — forum/group management
- `/admin/shadow/partners` — partner management
- `/admin/shadow/metrics` — detailed metrics

### Admin CRM (ShadowNet)

- `src/pages/Admin/DashboardPage.tsx` — KPI cards, funnel, segment donuts
- `src/pages/Admin/PeoplePage.tsx` — unified web+bot users, search, filters, profile drawer
- `src/pages/Admin/CommunityPage.tsx` → `GroupsManager` — forum topic CRUD
- `src/pages/Admin/PartnersPage.tsx` — partner management
- `src/pages/Admin/MetricsDashboard.tsx` — real metrics via API
- `src/components/Admin/AdminShell.tsx` — sidebar nav, global search (Ctrl+K)
- `src/components/Admin/People/UserProfilePanel.tsx` — full profile drawer with gap analysis

## Design System

Brand colors: `brand-purple` (#7C3AED) and `brand-green` (#65A30D), configured in `tailwind.config.js`. Font: Heebo (Hebrew) with system font fallbacks.

## RTL / Hebrew

All UI text is hardcoded Hebrew. Use `dir="rtl"` on containers. No i18n library. Tailwind handles RTL naturally; some components use explicit `text-right` and position-aware placement.

## Environment Differences

Controlled by `isProduction` in `src/utils/env.ts`:
- Dev: Admin CRM accessible, sample data button visible, debug routes available
- Prod: Admin routes redirect to home, sample data hidden

## Supabase

Key tables: `user_profiles`, `programs`, `admissions`, `bug_reports`, `leads`, `soft_leads`, `partners`, `bot_users`, `bot_messages_log`, `bot_groups`, `bot_campaigns`, `profile_links`. Migrations in `supabase/migrations/`.

## Key Types (src/types/)

- `SubjectGrade`: `{id, subject, units, grade, semel?, examDate?}`
- `PsychometricScores`: `{general, quantitative, verbal, english, total?}`
- `Program`, `AdmissionRequirement`, `LogicGroup`, `LogicCondition` — define program eligibility rules
- `database.types.ts` — auto-generated Supabase types

## Project Structure

```
api/                    Vercel serverless functions
  lib/telegram/         Bot handlers, services, client
  lib/shared/           Shared utilities
  metrics/              Metrics API endpoints
  cron/                 Cron jobs (drip campaigns, reminders)
src/
  components/           React components
    Admin/              ShadowNet CRM components
    Dashboard/          Student dashboard panels
    ProgramsExplorer/   Program search/filter
    blog/               Blog components
  pages/                Page-level components
    Admin/              Admin pages
  utils/                Calculation engine, helpers
  lib/                  Supabase client, consent, userData
  types/                TypeScript type definitions
  data/                 Static data (articles, etc.)
supabase/migrations/    Database migrations
scripts/                One-off utilities and dev scripts
docs/                   Project documentation
```
