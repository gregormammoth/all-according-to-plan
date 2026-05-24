# AGENTS.md — All According to Plan

**Version:** 1.1 · **Audience:** Cursor, Claude Code, autonomous coding agents

Read this file before any non-trivial change. Process details live in `.cursor/rules.md`. Scoped enforcement: `.cursor/rules/*.mdc`.

---

## Agent quick start (60 seconds)

1. Identify **one** owning package (see [Ownership](#ownership-matrix)).
2. Declare **goal**, **in-scope paths**, **out-of-scope paths**, **success criteria** before editing.
3. Verify behavior in **source** (not docs alone) — see [Source-of-truth hierarchy](#source-of-truth-hierarchy).
4. Stay within [scope caps](#scope-limitation-rules); stop and ask if exceeded.
5. Run [verification gates](#verification-gates) before claiming done.
6. Do **not** commit, push, or open PRs unless the user explicitly asks.

---

## Product (context only)

Browser-based dystopian political strategy game: **25 rounds**, **3 player actions** per round, mandatory **event modal**, deterministic outcomes. UI = **government command interface** (not TCG / gacha / fantasy).

---

## Source-of-truth hierarchy

When sources disagree, resolve in this order:

| Priority | Source | Governs |
|----------|--------|---------|
| 1 | `packages/game-engine/src/**/*.ts` | Actual gameplay behavior |
| 2 | `packages/shared/src/types.ts`, `data/cards.json` | Data model & card definitions |
| 3 | `GAME_MECHANICS.md` | Documented rules (must match engine) |
| 4 | `README.md` | Player-facing summary |
| 5 | `AGENTS.md` / `.cursor/rules.md` | Process only — **never** override engine |

**Never** implement behavior because README or AGENTS.md says so without confirming in engine source.

### High-risk hallucination targets (always open file)

| Topic | Authoritative file(s) |
|-------|------------------------|
| Event pool / rotation | `packages/game-engine/src/round.ts` (`MOCK_EVENTS`) |
| Election rounds & scoring | `packages/game-engine/src/round.ts` |
| RNG / dice | `packages/game-engine/src/rng.ts` |
| Card asset vs event | `packages/game-engine/src/state.ts` (`inferCardType`, `normalizeCard`) |
| Play / draw / discard | `packages/game-engine/src/play.ts`, `deck.ts` |
| Audio paths | `apps/web/audio/soundManifest.ts`, `apps/web/public/audio/` |
| UI panel responsibilities | `apps/web/components/game/GameShell.tsx` |

Note: `apps/mock-server` is **not** the runtime event source for the web client.

---

## Ownership matrix

| Path | Owner | May change when task is |
|------|-------|-------------------------|
| `packages/game-engine/` | **Rules** | Gameplay, phases, RNG, events, scoring |
| `packages/shared/` | **Contracts** | Types, constants, `cards.json`, pure helpers |
| `apps/web/state/` | **Client state** | Zustand wiring to engine only |
| `apps/web/components/game/` | **Game UI** | Layout, panels, modals |
| `apps/web/components/cards/` | **Directive UI** | Card presentation & interaction |
| `apps/web/lib/motion/` | **Motion** | Animation tokens/variants |
| `apps/web/audio/` | **Audio** | Howler, manifest, hooks |
| `apps/web/components/three/` | **3D scene** | Three.js only |
| `packages/ui/` | **Legacy** | Deprecation fixes only — **no new features** |
| `apps/api/` | **Stub API** | Only when user requests backend work |
| `GAME_MECHANICS.md` | **Rules docs** | Same task as engine rule change |
| `apps/web/DESIGN.md` | **Visual spec** | Same task as UI style change |

**Cross-package tasks** require a written plan and ordered steps: `shared` → `game-engine` → `apps/web`.

---

## Forbidden actions

Agents **must not** perform these without **explicit user approval** in the current message:

### Git & delivery

- `git commit`, `git push`, `git merge`, `gh pr create`
- `git reset --hard`, `git clean -fd`, `git push --force` (especially to `main`/`master`)
- `git commit --amend` (except hook recovery per project git rules)
- Changing `.gitignore` to track secrets or ignore required assets

### Gameplay integrity

- `Math.random()` outside `packages/game-engine/src/rng.ts`
- Mutating `GameState` in React/components/hooks without an engine function result
- Duplicating rule logic in `apps/web` (cost pay, clamps, phase transitions, dice)
- Changing `gameSeed` / RNG algorithm without migration plan + tests
- Shipping card balance changes in `cards.json` without user sign-off on design intent

### Architecture & deps

- New npm dependencies (any workspace)
- New state library (Redux, MobX, Jotai, etc.)
- Moving gameplay authority to `apps/api` or `mock-server`
- New top-level `src/` or second web app
- Expanding `packages/ui` with new components

### Assets & infra

- Deleting or bulk-renaming `apps/web/public/audio/**`, `public/cards/**`
- Adding `.env` with real secrets; committing API keys
- Adding database, Redis, or cloud deploy config without spec

### Code quality anti-patterns

- Repo-wide format/lint “drive-by” on untouched files
- Renaming symbols across packages in one task
- Removing user-facing animations entirely when asked to fix bugs (decouple input instead)
- Introducing `playSelectMode`-style duplicate gameplay flags in UI stores
- `// @ts-ignore` / `eslint-disable` on touched lines without user approval

### Autonomy traps

- “Fix everything”, “clean up the codebase”, “improve architecture” without scoped paths
- Implementing features not in the user message or plan
- Claiming “tests pass” when no test command exists for the change

---

## Scope limitation rules

### Mandatory declaration (first agent message)

```text
Goal:
In scope: (paths)
Out of scope: (paths)
Package owner:
Success criteria:
```

### Hard caps (stop and ask user to split task if exceeded)

| Tier | Max files changed | Max packages | Planning required |
|------|-------------------|--------------|-------------------|
| XS | 2 | 1 | No |
| S | 5 | 1 | No |
| M | 10 | 2 | Yes |
| L | 10+ | 2+ | Yes + user approval |

Counts include docs/tests only when listed in scope.

### Default out-of-scope (unless explicitly included)

- `packages/ui/**`
- `apps/api/**`, `apps/mock-server/**`
- `package-lock.json` (only touch if dependency task)
- Unrelated components, unrelated refactors
- `npm run format` on entire repo

### Escalation triggers (must stop, plan, get approval)

- Changing `GameState` or `Card` type shape
- Changing `normalizeCard` / `inferCardType`
- Touching `rng.ts` or reshuffle seed formula
- >3 files in `game-engine` for a “UI-only” task
- Any task labeled “refactor”, “rewrite”, “migrate”

---

## Migration safety rules

### `GameState` / shared types

1. Change `packages/shared/src/types.ts` first.
2. Update `game-engine` until `npm run build -w @all-according-to-plan/game-engine` passes.
3. Update `apps/web` consumers (`gameStore`, selectors, components).
4. Update `GAME_MECHANICS.md` in the **same** task.
5. Do not leave optional fields ambiguous — prefer explicit `| null` over undefined drift.

### `cards.json`

- Valid JSON; preserve existing ids unless migration requested.
- New cards: follow existing schema (`id`, `name`, `description`, `type` archetype, `cost`, `effects`).
- Remember: JSON `type` is usually **archetype**; engine sets `asset` | `event`.
- Run build (shared copies JSON to `dist` on build).
- **No** silent renames of card `id` (breaks saves/tests).

### Engine behavior changes

- Treat as **breaking** for determinism guarantees.
- Require: engine test **or** explicit user waiver + manual repro steps.
- Document old vs new behavior in PR description (when user requests PR).

### UI/store migrations

- One store at a time (`gameStore`, `motionStore`, `audioStore`).
- `motionStore` remains **non-gameplay** (visual/audio cues only).
- Preserve round snapshot revert compatibility when touching `roundSnapshot.ts`.

### Rollback

Every M/L task plan must state: `git checkout -- <paths>` or revert commit hash.

---

## Verification gates

Run commands; do not skip based on assumptions.

### Gate A — always (any code change)

```bash
npm run build -w @all-according-to-plan/shared -w @all-according-to-plan/game-engine
```

If `apps/web` touched:

```bash
cd apps/web && npm run build
```

If root workspace graph touched:

```bash
npm run build
```

### Gate B — lint (touched packages)

```bash
npm run lint
```

Web-only: `cd apps/web && npm run lint`

### Gate C — tests (when present)

| Change location | Command |
|-----------------|---------|
| `game-engine` | `npm test -w @all-according-to-plan/game-engine` |
| `shared` | `npm test -w @all-according-to-plan/shared` |

**Until Vitest exists:** engine behavior changes require **manual repro checklist** (min 3 steps) in the agent report.

### Gate D — engine behavior change (mandatory checklist)

- [ ] Identified transition function(s) in `game-engine`
- [ ] `GAME_MECHANICS.md` updated or confirmed already accurate
- [ ] No new nondeterminism
- [ ] Manual repro: start game → action → expected state field values

### Failure protocol

If build/lint fails: fix before reporting done. Do not hand off broken builds.

---

## Refactoring constraints

| Allowed | Not allowed |
|---------|-------------|
| Extract function in **same file** | Move rules from engine to web |
| Rename **private** helper in one file | Rename exported engine APIs without full call-site update |
| Replace duplicate **UI** markup with existing `DirectiveCard` | Replace engine module structure without plan |
| Delete dead code **only if** grep shows zero imports | Delete `public/` assets without approval |

**Refactor budget:** max **3** moved/renamed exported symbols per task. Exceeding → split task.

**Framer/Motion refactors:** no new `layout` props on hand strip or directive panels.

---

## Testing gates (policy)

| Change type | Requirement |
|-------------|-------------|
| `game-engine` logic | **Required:** unit test with fixed `gameSeed` **when harness exists**; until then: Gate D checklist |
| `shared` helpers | Test if adding non-trivial logic |
| `cards.json` only | Build + spot-check in UI; no engine test required |
| `apps/web` styling | Build + visual component path cited |
| `apps/web` store wiring | Build + manual play-through steps |
| Docs-only | No build unless links/code samples changed |

**Prohibited:** tests that only assert mocks; tests that duplicate entire engine in web.

---

## PR review heuristics (when user requests PR)

Use as review commentary structure:

1. **Determinism:** Any new randomness or time-based logic?
2. **Boundary:** Does web call engine for every state transition?
3. **Scope:** Diff matches stated goal? Unexpected packages?
4. **Data:** `cards.json` diff intentional? Id renames?
5. **UX:** Input blocked by animation? Asset/event panels correct?
6. **A11y:** Interactive elements keyboard/screen-reader viable?
7. **Deps:** New packages justified?
8. **Evidence:** Build/lint/test commands run?

**Block merge** if: engine changed without docs/tests (per policy); `GameState` shape changed without web update.

---

## Context management (long sessions)

### Read order (minimize tokens, maximize accuracy)

1. This file (process + caps)
2. Task-relevant source files (via search, not whole repo)
3. One doc: `GAME_MECHANICS.md` **or** `DESIGN.md` **or** `AUDIO.md` — not all unless needed

### Do not load into context unnecessarily

- Entire `cards.json` (grep id/archetype)
- `package-lock.json`
- Generated `dist/`, `.next/`
- Full `round.ts` unless editing events/elections

### Handoff between agents

Leave for next agent:

```text
## Handoff
Done: (bullet list)
Not done: (bullet list)
Files touched: (paths)
Verify: (commands run + results)
Open questions: (max 3)
```

### Session drift prevention

If the user pivots tasks, **re-declare scope** before new edits. Do not accumulate unrelated fixes.

---

## Memory persistence (for long-running projects)

Cursor/Claude do not retain memory across unrelated chats. Persist via **files**:

| What to persist | Where |
|-----------------|--------|
| Process & caps | `AGENTS.md`, `.cursor/rules.md` (this repo) |
| Scoped UI/engine rules | `.cursor/rules/*.mdc` |
| Rules of record | `GAME_MECHANICS.md` |
| Visual contract | `apps/web/DESIGN.md` |
| **Task-specific decisions** | User message + optional `docs/decisions/NNNN-title.md` |
| **Deferred work** | GitHub issue or `docs/backlog.md` (if user maintains) |

**Do not** rely on chat history for: card ids, seed formulas, file paths, or “we decided yesterday”.

**When to add `docs/decisions/NNNN-*.md`:** cross-package choice, RNG change, new persistence layer — include date, decision, alternatives rejected.

**Anti-pattern:** Storing gameplay rules only in AGENTS.md; they belong in engine + `GAME_MECHANICS.md`.

---

## Stack & dependencies (reference)

npm workspaces + Lerna · TypeScript · `game-engine` · `shared` · Next 15 · React 19 · Zustand · Tailwind · Framer Motion · Howler · Three.js

```
apps/web → game-engine → shared
packages/ui → shared (legacy)
```

`predev` builds `shared`, `game-engine`, `ui` before `dev`.

---

## Parallel agents

- One **writer** per file per branch
- Order: `shared` → `game-engine` → `apps/web`
- No concurrent edits to `cards.json` or `types.ts`
- Lock areas by directory in handoff message

---

## Coding preferences

Single quotes · minimal comments · thin Zustand · `cn()` for Tailwind · directive cards in `components/cards/`

---

## Known gaps (do not hallucinate fixes)

- No automated test suite yet (Vitest planned)
- Root ESLint excludes `apps/web` (use `next lint` there)
- `apps/api` not authoritative for gameplay

---

## Example prompts

**Good:** `In game-engine, add test: play event card discards and uses action. Files: play.test.ts, play.ts only.`

**Bad:** `Fix the game and make it better.`

---

## Document index

| File | Role |
|------|------|
| `.cursor/rules.md` | Full conventions, PR checklist, examples |
| `.cursor/rules/*.mdc` | Auto-applied scoped rules |
| `GAME_MECHANICS.md` | Player/engine rules |
| `apps/web/DESIGN.md` | Visual system |
