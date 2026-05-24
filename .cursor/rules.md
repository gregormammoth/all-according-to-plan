# Cursor rules — All According to Plan

**Companion to `AGENTS.md` (v1.1).** Cursor loads `.cursor/rules/*.mdc` for scoped enforcement.

---

## Critique log (why v1.1 changed)

| Issue in v1.0 | Risk | v1.1 fix |
|---------------|------|----------|
| Docs could override engine | Agents implement README fiction | Source-of-truth hierarchy |
| “≤5 files” soft guidance | Unbounded diffs | Hard caps + escalation |
| “Tests when exist” vague | Skipped verification | Testing gates table + Gate D |
| `playSelectMode` as rule | Stale negative knowledge | Moved to anti-pattern only |
| “layout unless justified” | Ambiguous | Refactor constraints: no new layout on hand |
| “Ask if adding deps” | Blocks autonomy inconsistently | Forbidden without approval |
| mock-server implied events | Wrong file edited | Explicit: events in `round.ts` |
| No migration steps | Broken builds mid-refactor | Migration safety section |
| No handoff format | Context loss | Context management + handoff template |
| PR checklist only in AGENTS | Duplication | PR heuristics in both; AGENTS = summary |

---

## 1. Forbidden actions (canonical list)

See `AGENTS.md` § Forbidden actions. Agents must treat any item there as **hard stop** unless the user’s current message explicitly approves.

**Compact deny-list:**

- Git write operations without request
- `Math.random()` outside `rng.ts`
- Direct `GameState` mutation in UI
- New dependencies
- Bulk asset deletion
- Cross-package renames
- Repo-wide format/lint sweeps
- Implementing unrequested features

---

## 2. Scope limitation rules

### Declaration template

```markdown
Goal:
In scope:
Out of scope:
Owner package:
Tier: XS | S | M | L
Success criteria:
```

### Caps

| Tier | Files | Packages | Plan |
|------|-------|----------|------|
| XS | ≤2 | 1 | No |
| S | ≤5 | 1 | No |
| M | ≤10 | ≤2 | Yes |
| L | >10 or >2 pkg | 2+ | Yes + approval |

**Stop rule:** If approaching cap mid-task, finish current file only, report, ask to continue.

### Default out-of-scope

`packages/ui/**`, `apps/api/**`, `apps/mock-server/**`, unrelated packages, lockfile (unless deps task).

---

## 3. Migration safety rules

### Type / state shape (`GameState`, `Card`, `Resources`)

1. `packages/shared/src/types.ts`
2. `game-engine` compile
3. `apps/web` compile
4. `GAME_MECHANICS.md`
5. Manual repro checklist

Never change types in `apps/web` alone.

### `cards.json`

- Validate JSON before commit
- Do not rename `id` without explicit migration task
- Archetype in JSON ≠ engine `card.type` — verify `normalizeCard`

### Determinism migrations

Changes to `rng.ts`, reshuffle, or dice thresholds require:

- Tests with fixed `gameSeed`, **or**
- Written user waiver + repro steps

### Store migrations

- `gameStore`: engine calls only in actions
- `motionStore`: never gates gameplay
- `audioStore`: never stores rules

---

## 4. Testing gates

### Current state

No Vitest in repo. **Gate D** (manual engine checklist) is mandatory for engine changes.

### When harness exists

| Path pattern | Gate |
|--------------|------|
| `packages/game-engine/**` (logic) | `npm test -w @all-according-to-plan/game-engine` required |
| `packages/shared/**` (helpers) | test if logic added |
| `apps/web/**` (UI) | build + lint; E2E optional |

### Test quality

- Use `gameSeed: 1337` (or documented seed) from `createInitialState`
- Assert exact numeric fields after transitions
- No testing React for engine rules

### Prohibited claims

- “All tests pass” without running command
- “Added comprehensive tests” for one-line UI tweak

---

## 5. Refactoring constraints

1. **One concern per task** — no refactor + feature
2. **Max 3 exported renames** per task across repo
3. **No engine → web** logic migration
4. **No deletion** of `HandDirectiveCard` / `DirectiveCard` system without replacement plan
5. **Motion:** transform/opacity only on `CardBar` strip
6. **Extract, don’t fork** — extend `DirectiveCard` variants before new card components

### Safe refactors (examples)

- Split long function in `round.ts` (same exports)
- Add selector to reduce Zustand re-renders
- Move inline styles to `variants.ts`

### Unsafe refactors (examples)

- “Unify” `packages/ui` and `apps/web` in one PR
- Global `GameState` rename
- Replace Zustand with Context for “simplicity”

---

## 6. PR review heuristics

### Severity guide

| Severity | Examples |
|----------|----------|
| **Blocker** | Nondeterminism; UI mutates rules; engine change w/o docs; build fails |
| **Major** | Wrong panel for asset/event; blocks input; new dep |
| **Minor** | Naming, spacing, copy tone |
| **Nit** | Optional style not in DESIGN.md |

### Review script (5 minutes)

1. Read PR goal vs diff stats (files, packages)
2. If `game-engine` touched → open `GAME_MECHANICS.md` diff
3. If `gameStore` touched → trace one action to engine function
4. If `cards.json` touched → check id/archetype only
5. Confirm CI commands (build/lint/test) listed in PR body

### Agent-as-reviewer output format

```markdown
## Verdict: Approve | Request changes
## Blockers
## Determinism check
## Scope check
## Suggested manual QA
```

---

## 7. Context management

### Token discipline

- Grep `cards.json` for single id, don’t read 500 lines
- Read function bodies, not whole `round.ts`, unless editing events
- One design doc per UI task

### Multi-step tasks

Split into sequenced agent runs:

1. Engine + tests + mechanics doc
2. Web store wiring
3. UI polish

Never start step 2 until step 1 builds.

### Handoff block (required at end of M/L tasks)

```text
## Handoff
Done:
Not done:
Files:
Commands:
Questions:
```

---

## 8. Memory persistence recommendations

| Persist | Do not persist |
|---------|----------------|
| Rules in `GAME_MECHANICS.md` | Ad-hoc chat agreements |
| Process in `AGENTS.md` | “Temporary” hacks in comments |
| ADRs in `docs/decisions/` | Card balance in agent memory |
| Backlog in issues/`docs/backlog.md` | File paths from memory |

**Create ADR when:** RNG, networking, save/load, or `GameState` shape changes.

**Refresh AGENTS.md** when: new package, new app, or ownership shift — not every feature.

---

## 9. Engineering conventions

(TypeScript, naming, imports — unchanged from v1.0; see `AGENTS.md` coding preferences.)

- Workspace imports: `@all-according-to-plan/*`
- Web alias: `@/` only inside `apps/web`
- Single quotes; no gratuitous comments

---

## 10. Architecture constraints

### Ownership (summary)

| Package | Role |
|---------|------|
| `game-engine` | All transitions |
| `shared` | Types + data |
| `apps/web` | Presentation |
| `packages/ui` | Legacy — no growth |

### Events source

Round events: `packages/game-engine/src/round.ts` (`MOCK_EVENTS`). Not `mock-server` for client gameplay.

### Card UX contract

- Click card → `gameStore.play` → `playCard`
- Assets → `PlayedCards` (active programs)
- Events → `DirectiveArchive` (advisor panel)
- No arm-to-play toggle unless user re-specifies

---

## 11. Hallucination guards (expanded)

| If agent claims… | Verify |
|------------------|--------|
| “Election every 4 rounds” | `round.ts`, `round % 4 === 0 && round < 25` |
| “3 actions then event” | `play.ts` / `beginEventModal` |
| “Card stays in hand” | `play.ts` hand removal |
| “Audio autoplays” | `AudioProvider`, unlock flow |
| “API saves game” | `apps/api` — likely false |
| Export exists | `package.json` exports + `index.ts` |

**Rule:** If verification file not opened in session, say “unverified” not “confirmed”.

---

## 12. Workflows that create tech debt (avoid)

| Workflow | Debt | Alternative |
|----------|------|-------------|
| UI copies engine formulas | Drift | Import from `shared` / call engine |
| New card component per screen | Duplication | `DirectiveCard` variants |
| Skipping mechanics doc | Wrong player expectations | Same-PR doc update |
| Giant agent PR | Unreviewable | Tier S splits |
| Storing rules in AGENTS.md | Double source | `GAME_MECHANICS.md` |
| `packages/ui` new exports | Two UIs | `apps/web` only |

---

## 13. Planning workflow

**Plan required:** M/L tier, `GameState` change, RNG, new package, audio rewrite.

**Plan template:** Goal → Current (file cites) → Proposed → In/Out scope → Risks → Test plan → Rollback.

**Skip plan:** XS tier, copy-only, single CSS fix.

---

## 14. Example prompts

### Good

```
Tier S. game-engine only. Fix draw when deck empty: add test with seed 1337.
In scope: deck.ts, deck.test.ts. Out of scope: apps/web.
```

### Bad

```
Align codebase with best practices and add tests everywhere.
```

---

## Related files

- `AGENTS.md` — entry point, gates, forbidden actions
- `.cursor/rules/monorepo-core.mdc` — always apply
- `.cursor/rules/ai-safety.mdc` — always apply
- `.cursor/rules/ownership.mdc` — always apply
- `.cursor/rules/game-engine.mdc` — engine glob
- `.cursor/rules/web-client.mdc` — web glob
