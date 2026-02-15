# Project Context for Antigravity

> **Authoritative source**: `CLAUDE.md` in the project root contains the full, maintained architecture documentation. This file mirrors the essentials so Antigravity has context.

> **Cross-tool workflow**: This project is developed with both Google Antigravity and Claude Code. **Before starting work, read `HANDOFF.md`** for recent changes by the other tool. **After finishing work, update `HANDOFF.md`** with what you did.

## Quick Summary

Israeli Bagrut grade calculator + university admission simulator. React 19 + TypeScript + Vite 7 + Tailwind CSS 3.4. Supabase backend. Vercel deployment. All UI is Hebrew RTL.

## Key Architecture

- **Frontend**: React SPA in `src/`, pages in `src/pages/`, components in `src/components/`
- **Backend**: Vercel serverless functions in `api/`
- **Telegram Bot**: Identity-first bot (@MitlabtimBot) in `api/lib/telegram/` — routes users to web, manages community
- **Admin CRM**: "ShadowNet" at `/admin/shadow/*` (dev only), pages in `src/pages/Admin/`
- **DB**: Supabase Postgres, migrations in `supabase/migrations/`
- **State**: Props from App.tsx, localStorage + Supabase sync, no Redux/Zustand
- **Path alias**: `@/*` → `./src/*`

## Community System

6 field clusters (tech, med, law, mind, business, design) mapped in `api/lib/telegram/clusters.ts`. Forum topics in one Telegram supergroup. Managed via `api/telegram-rooms.ts`.

## Important Conventions

- All UI text is hardcoded Hebrew, `dir="rtl"` on containers
- Brand colors: purple (#7C3AED) and green (#65A30D)
- Production check: `isProduction` from `src/utils/env.ts`
- Admin routes blocked in production
- Telegram API: HTML parse_mode for Hebrew
- No test runner configured — verify with `npm run build`

## Commands

- `npm run dev` — dev server (localhost:5173)
- `npm run build` — TypeScript check + production build
- `npm run lint` — ESLint

## See Also

- `CLAUDE.md` — full architecture docs (authoritative)
- `HANDOFF.md` — cross-tool session log (read before working!)
- `docs/` — additional documentation
