# AGENTS.md — All According to Plan

Operational guide for AI coding agents (Cursor, Claude Code, autonomous workers). Read this file before any non-trivial change.

## Product

**All According to Plan** is a browser-based dystopian political strategy card game. The player governs an authoritarian state across **25 rounds**, spending **3 actions per round** on directives (cards), then resolving a mandatory crisis or election event. Outcomes are graded as victory, survival, or failure.

This is **not** a collectible TCG, fantasy battler, or mobile gacha product. UI and copy should feel like a **government command interface**: ministries, decrees, bureaucracy, institutional danger.

## Users

- Solo players in the browser (primary)
- Designers / engineers extending cards, events, and UI (secondary)
- Future: optional API consumers via `apps/api` (minimal today)

## Team context

Small team / solo-friendly monorepo. Optimize for **maintainability**, **deterministic gameplay**, and **safe AI iteration** over clever abstractions.

## Stack

| Layer | Technology |
|-------|------------|
| Monorepo | npm workspaces + Lerna |
| Language | TypeScript 5.7 (strict) |
| Game rules | `packages/game-engine` (pure TS, no `Math.random`) |
| Types & data | `packages/shared` (`cards.json`, `GameState`, helpers) |
| Web client | Next.js 15, React 19, Zustand, Tailwind, Framer Motion, Howler, Three.js |
| API | NestJS placeholder (`apps/api`) |
| Mock server | `apps/mock-server` (events JSON) |
| Shared UI (legacy) | `packages/ui` — prefer `apps/web` components for new work |

## Infrastructure

- **No production cloud stack in-repo** (static Next build, local dev)
- **No database** in current gameplay path; state is client-side Zustand + engine
- Audio/assets served from `apps/web/public/`

## Architecture goals

1. **Deterministic gameplay** — same seed + actions ⇒ same outcomes (RNG in `game-engine` only)
2. **Engine / UI separation** — rules never live only in React
3. **Incremental iteration** — small PRs, scoped agent tasks
4. **AI-first maintainability** — explicit boundaries, docs, tests on engine
5. **Cinematic but non-blocking UI** — motion must not gate input

## Hard constraints

- Do **not** add `Math.random()` to gameplay logic outside `packages/game-engine/src/rng.ts`
- Do **not** mutate `GameState` in UI without going through engine functions (`playCard`, `drawCard`, etc.)
- Do **not** change `cards.json` effect semantics without updating `GAME_MECHANICS.md` and engine tests
- Do **not** redesign the product into Hearthstone / fantasy TCG aesthetics
- Do **not** commit, push, or open PRs unless the user explicitly asks
- Do **not** run destructive git commands (`reset --hard`, force push to main)
- Prefer **minimal diffs** — no drive-by refactors

## Repository map

```
all-according-to-plan/
├── AGENTS.md                 ← you are here
├── README.md                 ← player-facing overview
├── GAME_MECHANICS.md         ← rules reference (engine-aligned)
├── apps/
│   ├── web/                  ← primary client (Next.js)
│   │   ├── app/              ← routes, globals.css
│   │   ├── components/       ← game/, cards/, motion/, ui/, audio/
│   │   ├── state/            ← Zustand (gameStore, motionStore, roundSnapshot)
│   │   ├── audio/            ← Howler singleton, manifest
│   │   └── lib/              ← motion tokens, cards artwork, ui variants
│   ├── api/                  ← NestJS stub
│   └── mock-server/
├── packages/
│   ├── shared/               ← types, cards.json, stat helpers
│   ├── game-engine/          ← authoritative rules
│   └── ui/                   ← legacy shared React (avoid for new features)
```

## Package dependency rules

```
apps/web  →  game-engine, shared
game-engine  →  shared
apps/api  →  (minimal)
packages/ui  →  shared
```

- **Never** import `apps/web` from `packages/*`
- **Never** import React from `game-engine` or `shared`
- New gameplay logic → `game-engine`; new types/constants → `shared`

## Task execution workflow

### 1. Orient (required)

1. Read `AGENTS.md` (this file) and `.cursor/rules.md`
2. For gameplay: read `GAME_MECHANICS.md`
3. For UI/visuals: read `apps/web/DESIGN.md`
4. For audio: read `apps/web/AUDIO.md`
5. Identify **one** primary package to touch

### 2. Scope (required)

Every task must declare:

- **Goal** (one sentence)
- **In scope** (files/packages)
- **Out of scope** (explicit)
- **Success criteria** (build passes, behavior X)

Default scope limits:

| Task type | Max blast radius |
|-----------|------------------|
| Bug fix | ≤5 files, 1 package |
| UI polish | `apps/web` only |
| New card | `cards.json` + docs + optional test |
| Engine rule | `game-engine` + tests + `GAME_MECHANICS.md` |

### 3. Implement

- Match existing naming, imports (`@all-according-to-plan/*`), and patterns
- Use **single quotes** in TS/TSX
- Avoid new comments unless non-obvious business logic
- UI: transform/opacity animations; avoid layout-thrashing `layout` props unless justified

### 4. Verify (required)

```bash
npm run build                    # full monorepo
npm run lint                     # all packages
cd apps/web && npm run build     # after web-only changes
```

When tests exist:

```bash
npm test -w @all-according-to-plan/game-engine
```

### 5. Report

- What changed and **why**
- What was **not** changed (prevents drift)
- How to manually verify in browser

## Planning mode

Use planning before:

- Cross-package refactors
- New systems (auth, multiplayer, persistence)
- Changing phase machine or RNG
- Touching >10 files

Planning output must include: current behavior, proposed behavior, files touched, risks, rollback, test plan.

Do **not** plan endlessly for single-file fixes.

## Parallel agents

When multiple agents may run concurrently:

- **Do not** edit the same file in two branches without coordination
- Prefer package-level ownership: Agent A = `game-engine`, Agent B = `apps/web/components/cards`
- Engine changes land **before** UI that depends on new state fields
- Avoid global renames across the monorepo in one session

## AI safety rules

| Rule | Rationale |
|------|-----------|
| No invented APIs | Read exports from `package.json` / `index.ts` |
| No invented game rules | Cite `GAME_MECHANICS.md` or engine source |
| No silent behavior change | Engine changes need tests or explicit user approval |
| No dependency additions without need | Ask if adding heavy libs |
| No deleting audio/assets without confirmation | User-facing breakage |
| Verify build | Do not claim done without running build |
| Idempotent state updates | Zustand actions call engine, then set full slices |

## Code review standards (agent self-check)

- [ ] Engine/UI boundary respected
- [ ] Determinism preserved
- [ ] Types exported from `shared`, not duplicated in web
- [ ] No `playSelectMode`-style duplicate state unless documented
- [ ] Framer: no blocking interaction on animations
- [ ] Accessibility: buttons have `aria-label` where icon-only
- [ ] No secrets in repo
- [ ] `npm run build` passes

## Testing requirements

**Today:** no automated tests in repo (gap). **Target:**

| Package | Priority | Tool |
|---------|----------|------|
| `game-engine` | P0 | Vitest — pure functions, golden paths |
| `shared` | P1 | Vitest — helpers, clamps |
| `apps/web` | P2 | Playwright or RTL — critical flows only |

When adding engine tests:

- Use fixed `gameSeed` and assert exact state fields
- Cover: play card, draw, reshuffle, election failure, collapse, round advance

Agents **should add tests** when changing `game-engine` behavior.

## Coding preferences

- TypeScript strict; no `any` without justification
- Small pure functions in engine; thin Zustand actions in web
- Zustand: selectors, avoid storing derivable state
- Tailwind + `cn()` from `lib/ui/cn.ts`
- Card UI: `components/cards/*`, `lib/cards/*`
- Motion: `lib/motion/tokens.ts`, `variants.ts`, `MotionProvider`

## Known tech debt

- `packages/ui` overlaps `apps/web` — do not expand `packages/ui` for new features
- `apps/api` is placeholder — do not assume server authority for gameplay
- Root ESLint ignores `apps/web` — web uses Next ESLint config
- No CI test gate yet — build + lint are the bar

## Documentation index

| Doc | Use when |
|-----|----------|
| `README.md` | Product summary, quick start |
| `GAME_MECHANICS.md` | Rule changes, event flow |
| `apps/web/DESIGN.md` | Visual tokens, motion, panels |
| `apps/web/AUDIO.md` | Sound layers, unlock, bed |
| `.cursor/rules.md` | Conventions + prompts |

## Example prompts

### Good

> In `packages/game-engine`, add a unit test proving election failure sets `game_over` with `type: 'failure'`. Do not change UI.

> In `apps/web/components/cards/DirectiveCard.tsx`, fix disabled hover styles only. Run `apps/web` build. No engine changes.

### Bad

> Refactor the entire game to use Redux and microservices.

> Make cards look like Hearthstone with particle effects and rewrite the engine for realtime multiplayer.

> Fix everything in the codebase and add tests everywhere.
