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

## Workflow: Notion as Source of Truth for Planning

**Both Claude Code and Antigravity have Notion MCP access.**

### Notion Project Page
- **URL**: `https://www.notion.so/2278615a853780a69d1ffb56dbb8a3cb`
- **Product Backlog** database (data source ID: `12fa2e47-c9e1-4640-b47b-e3b8974f29ed`) — all tasks, prioritized
- **CRM** database (data source ID: `d0eb8892-85db-46c8-930b-b3343c55ad13`) — potential clients (lead buyers)
- **UX/UI State** page — app structure, screens, components (keep updated!)

### Workflow Rules
1. **Before starting work**: Read `HANDOFF.md` + check Notion backlog for current Sprint tasks
2. **Pick a task**: Move it to "בתהליך" (in progress) in Notion
3. **After finishing**: Mark "הושלם" in Notion + update `HANDOFF.md`
4. **New ideas**: Add to Notion backlog with סטטוס="Backlog"
5. **CRM updates**: When sales conversations happen, update the Notion CRM
6. **UX changes**: Update the UX/UI State page when modifying UI

### Source of Truth
- **Notion** = planning, tasks, CRM, UX/UI docs
- **Code** = what's actually built (overrides Notion if conflict)
- **HANDOFF.md** = session-to-session bridge
- **CLAUDE.md** = architecture reference

## See Also

- `CLAUDE.md` — full architecture docs (authoritative)
- `HANDOFF.md` — cross-tool session log (read before working!)
- Notion Project: `https://www.notion.so/2278615a853780a69d1ffb56dbb8a3cb`
