# Cursor rules — All According to Plan

Master conventions for AI-assisted development. Cursor also loads scoped rules from `.cursor/rules/*.mdc`.

## Project profile

| Field | Value |
|-------|--------|
| Product | Dystopian political strategy card game (browser) |
| Users | Solo players; internal designers/engineers |
| Team | Small / solo |
| Frontend | Next.js 15, React 19, Zustand, Tailwind, Framer Motion, Three.js |
| Backend | NestJS stub (`apps/api`), not authoritative for gameplay |
| Data | In-memory client state; `cards.json` in `packages/shared` |
| Infra | None in-repo (static export / local dev) |
| Goals | Determinism, maintainability, safe AI iteration |
| Constraints | Engine/UI split, no randomness outside engine RNG |

---

## 1. Engineering conventions

### TypeScript

- Strict mode; prefer explicit return types on exported engine functions
- Use workspace imports: `@all-according-to-plan/shared`, `@all-according-to-plan/game-engine`
- Single quotes for strings
- No `enum` unless already established in file — prefer string unions from `shared`
- Avoid `as` casts; fix types at source

### Formatting

- Prettier via `npm run format` (root)
- Do not fight ESLint; fix warnings in touched files when practical

### Naming

| Kind | Pattern | Example |
|------|---------|---------|
| React components | PascalCase | `DirectiveCard.tsx` |
| Hooks | `use` prefix | `useGameAudio.ts` |
| Zustand stores | `useXStore` | `useGameStore` |
| Engine functions | verb + noun | `playCard`, `continueAfterAppliedEvent` |
| Types | PascalCase | `GameState`, `Card` |
| Files | kebab or camel matching folder | `roundSnapshot.ts` |

### Imports

```typescript
import type { Card } from '@all-according-to-plan/shared';
import { playCard } from '@all-according-to-plan/game-engine';
```

Order: external → workspace → `@/` alias (web only) → relative

### Comments

- Default: **no comments** in new code
- Allowed: non-obvious business rules, engine invariants, `@deprecated`

---

## 2. Architecture constraints

### Layered authority

```
┌─────────────────────────────────────┐
│  apps/web (presentation + input)   │
│  Zustand → calls engine → set state │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│  packages/game-engine (rules)       │
│  pure transitions, deterministic RNG│
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│  packages/shared (types + data)     │
└─────────────────────────────────────┘
```

### State ownership

| State | Owner |
|-------|--------|
| `GameState` | Engine produces; web stores copy in `gameStore` |
| `playSelectMode` | **Removed** — do not reintroduce arm-to-play without spec |
| Motion cues | `motionStore` (visual only, never gameplay) |
| Audio settings | `audioStore` + `AudioManager` singleton |
| Round revert snapshot | `roundSnapshot.ts` |

### Determinism

- RNG: `packages/game-engine/src/rng.ts` only
- Reshuffle seed: documented in `README.md` / `GAME_MECHANICS.md`
- UI must not roll dice or shuffle decks

### Card data pipeline

1. Author edits `packages/shared/src/data/cards.json`
2. `normalizeCard` in `game-engine/src/state.ts` maps archetypes → `asset` | `event`
3. UI reads `Card` from library Map — never parse raw JSON in components

### UI architecture (`apps/web`)

| Area | Location |
|------|----------|
| Game layout | `components/game/GameShell.tsx` |
| Operational hand | `components/game/CardBar.tsx` + `components/cards/HandDirectiveCard.tsx` |
| Active programs | `components/game/PlayedCards.tsx` |
| Event archive | `components/cards/DirectiveArchive.tsx` in advisor panel |
| Motion tokens | `lib/motion/` |
| Design tokens | `tailwind.config.ts`, `lib/ui/variants.ts` |
| Card system | `components/cards/`, `lib/cards/` |

### Forbidden patterns

- Game rules in `useEffect` without engine call
- Duplicating `canPay` / stat clamp logic in web (use `shared` helpers)
- Framer `layout` on hand cards or panels that cause layout shift
- Global `isAnimating` flags that block card play
- Importing `three` outside `components/three/`

---

## 3. AI agent safety rules

### Must do

1. Read `AGENTS.md` + relevant mechanic/design docs before coding
2. State scope and out-of-scope in the first response
3. Run `npm run build` (or package build) before claiming complete
4. Use existing components (`DirectiveCard`, `Panel`, `Button`) before creating parallels
5. Preserve deterministic engine behavior

### Must not

1. Invent card effects, event steps, or phases not in docs/source
2. Rewrite architecture (Redux, tRPC game state, etc.) without explicit request
3. Remove animations entirely when asked to fix bugs — decouple from input instead
4. Add `Math.random()` to gameplay
5. Commit/push/PR unless user asks
6. Touch unrelated files “while here”
7. Generate placeholder lorem for user-visible copy — use institutional tone

### Uncertainty protocol

If behavior is ambiguous:

1. Search `game-engine` for the function name
2. Read `GAME_MECHANICS.md`
3. Ask one focused question — do not guess rule outcomes

### Hallucination guards

| Claim | Verify in |
|-------|-----------|
| Card is asset vs event | `inferCardType` / normalized `card.type` |
| Action count | `maxPlayerActionsPerRound`, `playerActionsUsed` |
| Election rounds | `round % 4 === 0 && round < 25` |
| Audio file path | `audio/soundManifest.ts`, `public/audio/` |

---

## 4. Task execution guidelines

### Task sizing

| Size | Files | Duration target |
|------|-------|-----------------|
| XS | 1–2 | <30 min agent time |
| S | 3–5 | Single package |
| M | 6–10 | Needs plan |
| L | 10+ | Split into multiple PRs / agent runs |

### Branch discipline

- One logical change per agent session
- Do not mix engine rule change + unrelated UI redesign

### Definition of done

1. Code compiles (`npm run build`)
2. Lint clean on touched packages
3. Manual test steps listed
4. Docs updated if behavior or data model changed
5. Tests added/updated if `game-engine` behavior changed (once Vitest exists)

### Commit messages (when user asks)

- Imperative mood, 1–2 sentences, explain **why**
- Example: `Keep play mode armed while player actions remain to fix card pacing.`

---

## 5. Repo structure recommendations

### Current (keep)

- Monorepo with `packages/*` + `apps/*`
- Engine and shared as compiled TS libraries

### Recommended additions

```
all-according-to-plan/
├── .cursor/rules/           # scoped .mdc rules (exists)
├── AGENTS.md
├── docs/                    # optional: planning ADRs later
├── packages/game-engine/
│   └── src/__tests__/       # Vitest (*.test.ts)
├── vitest.config.ts         # root or per-package
└── .github/workflows/ci.yml # build + lint + test
```

### Do not add (without spec)

- `src/` at repo root
- Second web app
- GraphQL layer for local-only game

---

## 6. Linting & testing stack

### Current

| Tool | Scope |
|------|--------|
| ESLint 9 flat | Root (excludes `apps/web`) |
| `next lint` | `apps/web` |
| Prettier | Root `npm run format` |
| TypeScript | per-package `tsconfig.json` |

### Recommended

| Tool | Purpose |
|------|---------|
| **Vitest** | `game-engine`, `shared` unit tests |
| **@testing-library/react** | Optional web component tests |
| **Playwright** | Smoke: load game, play card, event modal |
| **CI** | `build` + `lint` + `test` on PR |

### Test-first for engine

When changing rules:

1. Write failing test with fixed seed
2. Implement change
3. Update `GAME_MECHANICS.md`

---

## 7. Code review checklist

### Gameplay / engine

- [ ] Transition function returns `{ ok, state }` or established pattern
- [ ] Stats/resources clamped via shared helpers
- [ ] Phase transitions documented
- [ ] No new nondeterminism
- [ ] `cards.json` valid JSON; archetypes normalize correctly

### Web / UX

- [ ] Engine called from `gameStore` actions only
- [ ] Directives clickable without separate “Play” arm (unless spec changes)
- [ ] Assets vs events: correct panel (active programs vs archive)
- [ ] Animations use transform/opacity; interactions not blocked
- [ ] `prefers-reduced-motion` respected via `MotionProvider`
- [ ] DESIGN.md aesthetic: no neon / fantasy TCG

### General

- [ ] No secrets, API keys, or `.env` committed
- [ ] Dependencies justified
- [ ] Build passes

---

## 8. Planning workflow instructions

### When to plan

- Multi-package features
- New persistence or multiplayer
- Card format migration
- Audio system rewrites
- >10 files or ambiguous requirements

### Plan template

```markdown
## Goal
## Current behavior (cite files)
## Proposed behavior
## Files in scope
## Files explicitly out of scope
## Risks (determinism, UX, perf)
## Test plan
## Rollback
```

### When to skip planning

- Single-component style fix
- Copy tweak
- Typo in docs
- One-function engine bug with obvious test

### Cursor Plan mode

Use Plan mode for architectural tradeoffs. Exit Plan with explicit file list before Agent implements.

---

## 9. Design & content constraints

- Tone: bureaucratic, cold, institutional (see `DESIGN.md`)
- Cards: dossier / directive, not TCG rarity frames
- Colors: `state-*`, `faction-*`, `board-ink` tokens only
- Typography: Barlow Condensed (display), IBM Plex Sans (body)

---

## 10. Example prompts

### Good prompts

```
Add Vitest to game-engine. One test: playing an event card moves it to discard 
and increments playerActionsUsed. Do not touch apps/web.
```

```
DirectiveCard: increase artwork aspect ratio on hand variant only. 
Use transform hover. Verify apps/web build.
```

```
Document election score formula in GAME_MECHANICS.md to match round.ts. 
No code changes unless doc differs from implementation.
```

### Bad prompts

```
Make the game funnier and more colorful.
```

```
Rewrite everything to use MobX and add blockchain achievements.
```

```
Fix all bugs and improve architecture across the repo.
```

---

## Related files

- `AGENTS.md` — agent entry point
- `.cursor/rules/*.mdc` — auto-applied scoped rules
- `GAME_MECHANICS.md` — rules source of truth
- `apps/web/DESIGN.md` — UI system
