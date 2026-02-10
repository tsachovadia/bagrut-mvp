# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Israeli Bagrut (high school) grade calculator and university admission simulator. Students enter grades, get weighted averages with university-specific bonuses, and see admission eligibility across programs. Includes an admin CRM ("ShadowNet") for lead management. All UI is in Hebrew with RTL layout.

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

### Routing

React Router v7 in `App.tsx`. Main routes: `/` (calculator), `/programs` (search), `/program/:id`, `/dashboard` (simulator), `/tracking` (saved programs). Admin routes under `/admin/shadow/*` are blocked in production via `isProduction` from `utils/env.ts`.

## Design System

Brand colors: `brand-purple` (#7C3AED) and `brand-green` (#65A30D), configured in `tailwind.config.js`. Font: Heebo (Hebrew) with system font fallbacks.

## RTL / Hebrew

All UI text is hardcoded Hebrew. Use `dir="rtl"` on containers. No i18n library. Tailwind handles RTL naturally; some components use explicit `text-right` and position-aware placement (`left-4`, `right-4`).

## Environment Differences

Controlled by `isProduction` in `src/utils/env.ts`:
- Dev: Admin CRM accessible, sample data button visible, debug routes available
- Prod: Admin routes redirect to home, sample data hidden

## Supabase

Key tables: `user_profiles`, `programs`, `admissions` (logic rules as JSON), `bug_reports`, `leads`, `soft_leads`, `partners`. Migrations in `supabase/migrations/`.

## Key Types (src/types/)

- `SubjectGrade`: `{id, subject, units, grade, semel?, examDate?}`
- `PsychometricScores`: `{general, quantitative, verbal, english, total?}`
- `Program`, `AdmissionRequirement`, `LogicGroup`, `LogicCondition` — define program eligibility rules
- `database.types.ts` — auto-generated Supabase types
