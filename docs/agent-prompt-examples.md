# Agent prompt examples — All According to Plan

Copy-paste templates for Cursor Agent, Claude Code, and autonomous workers.  
Process rules: `AGENTS.md` v1.1 · `.cursor/rules.md`

**Why structure matters:** Scoped prompts reduce hallucination, cross-package drift, and unreviewable diffs. Every good prompt answers: *who owns this*, *what files*, *what not to touch*, *how we know it’s done*.

---

## 1. Example task prompts

### GOOD — Tier S, single package, engine bug

```
Read AGENTS.md. Tier S.

Goal: After playing the third action, phase must enter event_modal immediately.

In scope:
- packages/game-engine/src/play.ts
- packages/game-engine/src/round.ts (read only unless fix is there)

Out of scope:
- apps/web/**
- packages/shared/**
- cards.json

Owner package: game-engine

Success criteria:
- Trace playCard → beginEventModal in source
- npm run build -w @all-according-to-plan/game-engine passes
- Gate D manual repro: 3 plays → state.phase === 'event_modal'

Do not commit. Report files read and state fields checked.
```

**Why good:** One owner, ≤5 files, cites verification gates, forbids web churn, requires source trace not README.

---

### GOOD — Tier S, UI-only

```
Tier S. apps/web only.

Goal: Disabled directive cards must not play hover sound.

In scope:
- apps/web/components/game/CardBar.tsx
- apps/web/components/cards/HandDirectiveCard.tsx (if needed)

Out of scope:
- packages/game-engine/**
- packages/shared/**
- audio/AudioManager.ts (unless one-line guard)

Success criteria:
- cd apps/web && npm run build && npm run lint
- Manual: hover disabled card → no card_hover SFX

No new dependencies. No commit.
```

**Why good:** UI boundary clear; audio scope explicitly bounded; web build gate named.

---

### GOOD — Tier S, new card data only

```
Tier S. shared only.

Goal: Add card id "ration_ledger" (economy archetype) to cards.json.

In scope:
- packages/shared/src/data/cards.json

Out of scope:
- game-engine, apps/web (unless build fails)

Success criteria:
- Valid JSON
- npm run build -w @all-according-to-plan/shared
- Note normalized type (asset vs event) per inferCardType in state.ts — cite line

Do not rebalance other cards. No commit.
```

**Why good:** Data-only scope; agent must verify archetype → asset/event in engine, not guess.

---

### BAD — unscoped “fix”

```
The game feels broken after playing cards. Fix it.
```

**Why bad:** No package, no files, no success criteria → agent refactors stores, motion, and engine.

---

### BAD — cross-package hidden in “small” ask

```
Quick fix: when an event card is played, show it in the advisor archive and animate it.
```

**Why bad:** Sounds like one feature but touches motionStore, CardBar, AdvisorPanel, DirectiveArchive, possibly gameStore — should be Tier M with ordered steps or split into 2 tasks.

---

### BAD — contradicts ownership

```
Update mock-server events.json so election events match the UI timeline.
```

**Why bad:** Web client events come from `game-engine/src/round.ts` (`MOCK_EVENTS`), not mock-server — wrong file, guaranteed drift.

---

## 2. Example planning prompts

Use **Plan mode** (Cursor) or “plan only, no code” (Claude) for Tier M/L.

### GOOD — cross-package feature

```
Plan only — do not write code yet.

Goal: Add "authority" cost display on DirectiveCard when cost.authority > 0.

Read AGENTS.md ownership matrix and DESIGN.md.

Deliver:
1. Current behavior (file:line) for cost display
2. Whether shared CardCost type already has authority
3. Proposed changes per package (shared → web only, or engine too?)
4. Files in scope / out of scope
5. Tier (M or L?)
6. Verification gates
7. Rollback command
8. Risks (hallucination targets)

Out of scope for plan: packages/ui, apps/api, mock-server.
```

**Why good:** Forces read-first plan; explicit package order; no implementation during planning.

---

### GOOD — engine behavior change

```
Plan only.

Goal: Change election failure from immediate game_over to one more "grace" round.

In scope for analysis:
- packages/game-engine/src/round.ts
- GAME_MECHANICS.md
- apps/web/components/game/EventModal.tsx (read)

Must include:
- Exact current code path for election failure
- Whether RNG/determinism affected
- Test plan (Vitest cases with gameSeed 1337)
- Doc diff outline for GAME_MECHANICS.md
- Why this is Tier L

Stop before implementing.
```

**Why good:** High-risk area named; determinism and docs called out; tier escalation explicit.

---

### BAD — plan disguised as implementation

```
Plan how to migrate to Redux, then implement the migration in this session.
```

**Why bad:** L-tier architectural rewrite + implementation in one go; violates forbidden actions without approval.

---

### BAD — no “plan only” guard

```
Figure out the best architecture for multiplayer.
```

**Why bad:** Unbounded exploration; no files; will produce speculative docs not tied to repo.

---

## 3. Example debugging prompts

### GOOD — deterministic repro

```
Debug only. Tier S. game-engine.

Symptom: Reshuffle order differs between two runs with same seed (user reports).

In scope: packages/game-engine/src/deck.ts, rng.ts, shuffle.ts

Steps:
1. Find reshuffle seed formula in source (cite lines)
2. Compare to GAME_MECHANICS.md — report mismatch if any
3. Trace createInitialState gameSeed usage
4. Propose minimal fix OR prove bug is in UI (then stop and say which web file to open next)

Out of scope: apps/web unless engine proves correct.

Do not commit. Run build on game-engine after any fix.
```

**Why good:** Anchors determinism files; doc vs code check; allows pivot without web shotgun.

---

### GOOD — UI + boundary check

```
Debug. Tier S. apps/web.

Symptom: Clicking directive does nothing but no error toast.

In scope:
- apps/web/state/gameStore.ts (play action)
- apps/web/components/game/CardBar.tsx (handlePlay)
- packages/game-engine/src/play.ts (read)

Verify:
- play() calls playCard with library + state
- disabled logic in CardBar (dead, canPay)
- playingRef / pendingPlayExit blocking double play

Success: root cause with file:line, fix ≤3 files, apps/web build.

Forbidden: changing engine rules to "make it work".
```

**Why good:** UI symptom but requires engine read; caps files; forbids rule changes as hack.

---

### GOOD — audio (high hallucination area)

```
Debug. Tier S. apps/web/audio.

Symptom: base-ambient.ogg never plays after click.

In scope: AudioManager.ts, audioStore.ts, AudioProvider.tsx, soundManifest.ts

Verify in source (not memory):
- preload for base_ambient
- unlock() path
- ensureBaseAmbient / startGameplayBed
- muted flag

Out of scope: game-engine

Success: cite log points in dev; fix minimal; apps/web build.

Do not add new audio library.
```

**Why good:** Lists real files; forbids inventing paths; manifest verification required.

---

### BAD — symptom only

```
Background music doesn't work. Fix audio.
```

**Why bad:** Agent may replace Howler, delete assets, or add autoplay hacks across 20 files.

---

### BAD — wrong source of truth

```
Debug election events — check README and fix the timeline component.
```

**Why bad:** README is priority 4; election logic is in `round.ts` — likely wrong fix in Timeline.tsx only.

---

## 4. Example refactoring prompts

### GOOD — safe extract

```
Tier S. Refactor only (no behavior change).

Goal: Extract reshuffle seed string builder from deck.ts into a named pure function in the same file.

In scope: packages/game-engine/src/deck.ts only

Success criteria:
- git diff shows no logic change (only move/rename private helper)
- npm run build -w @all-according-to-plan/game-engine
- Gate D: one draw-after-empty-deck repro still same discard order with seed 1337

Forbidden: other files, exported API renames, formatting whole repo.
```

**Why good:** Same-file extract; explicit “no behavior change”; determinism smoke check.

---

### GOOD — UI dedupe

```
Tier S. apps/web.

Goal: Replace inline cost chips in one component with existing CardCostRow.

In scope: one file under components/cards/ (you pick after grep)

Out of scope: DirectiveCard API changes, engine, motion tokens

Success: apps/web build; visual parity; fewer duplicated markup lines
```

**Why good:** Reuses existing primitive; bounds API churn; single package.

---

### BAD — repo-wide refactor

```
Clean up the codebase: consistent naming, folder structure, and extract all magic numbers.
```

**Why bad:** Unbounded L-tier; violates refactor budget and scope caps.

---

### BAD — engine/UI merge

```
Refactor so GameState lives only in React Context and engine functions take hooks.
```

**Why bad:** Breaks architecture; forbidden pattern; nondeterminism and testability loss.

---

## 5. Example review prompts

### GOOD — PR diff review (no code)

```
Review only — do not modify files.

Review the current branch diff against main for:
- Determinism (rng.ts, Math.random, Date.now)
- Engine/UI boundary (gameStore → playCard)
- Scope creep (packages touched vs commit message)
- cards.json id renames
- Asset vs event panel correctness

Output format per .cursor/rules.md § PR review heuristics:
Verdict, Blockers, Determinism check, Scope check, Suggested manual QA.

Assume author claims "npm run build" passed — list what you would re-run.
```

**Why good:** Review-only guard; checklist aligned to repo risks; structured output.

---

### GOOD — post-agent handoff review

```
Review the last agent handoff in this chat.

Check:
1. Did they stay in declared in-scope paths?
2. Any forbidden actions (deps, git, engine in UI)?
3. Missing GAME_MECHANICS.md update for engine changes?
4. What manual QA is still required?

No code changes. List blockers only.
```

**Why good:** Long-session drift check; validates process not just code.

---

### BAD — rubber stamp

```
LGTM, merge it.
```

**Why bad:** No determinism or boundary check on a gameplay repo.

---

### BAD — review + feature creep

```
Review this PR and also add tests for everything while you're at it.
```

**Why bad:** Mixes review with new scope; invalidates review artifact.

---

## 6. Example subagent workflows

Use Cursor **Task** tool / subagents for parallel read-only exploration or isolated implementation.

### GOOD — parallel explore (read-only)

**Parent message:**

```
Launch two explore subagents in parallel (readonly):

Agent A: Map all game-engine exports used by apps/web/state/gameStore.ts — list imports and call sites.

Agent B: Map card UX flow: CardBar → HandDirectiveCard → gameStore.play → engine playCard — file path each step.

Do not implement. Synthesize into a handoff for a Tier S fix task.
```

**Why good:** Read-only parallelization; parent synthesizes; implementation is a follow-up task with scope.

---

### GOOD — sequential pipeline (engine then web)

**Step 1 — subagent:**

```
generalPurpose subagent. Tier S.

Add field `lastPlayedCardId: string | null` to GameState in shared, wire in engine only on successful playCard. Update GAME_MECHANICS.md state section.

In scope: shared/types.ts, game-engine/play.ts, GAME_MECHANICS.md
Out of scope: apps/web

Run build shared + game-engine. Handoff when done.
```

**Step 2 — parent after handoff:**

```
Tier S. apps/web only.

Consume lastPlayedCardId in DirectiveArchive flash — read handoff, do not re-derive engine.

In scope: motionStore.ts, DirectiveArchive.tsx, AdvisorPanel.tsx (≤5 files)
```

**Why good:** Respects `shared → engine → web` order; second agent does not re-litigate engine.

---

### GOOD — ci-investigator for build failure

```
ci-investigator: Summarize why PR #N build failed. Return: failing command, first error, suggested fix file, whether engine or web.

Parent will implement — you investigate only.
```

**Why good:** Narrow tool for CI; parent keeps implementation scope.

---

### GOOD — shell agent for verification only

```
shell subagent: Run only:
npm run build -w @all-according-to-plan/shared -w @all-according-to-plan/game-engine
cd apps/web && npm run build && npm run lint
Return exit codes and last 30 lines of any failure.

Do not fix. Parent interprets.
```

**Why good:** Separates verification from editing; reproducible gates.

---

### BAD — parallel writers

```
Subagent 1: Rewrite game-engine round.ts.
Subagent 2: Rewrite apps/web EventModal.tsx at the same time.
```

**Why bad:** Coupled files; merge conflicts; phase machine drift between agents.

---

### BAD — explore + implement in one subagent with vague goal

```
explore agent: Understand the whole repo and implement card improvements.
```

**Why bad:** Unbounded; explore agents should not ship large diffs without parent scope.

---

### BAD — subagent for git commit

```
shell agent: commit and push all changes with message "fixes".
```

**Why bad:** Forbidden without user request; no review gates.

---

## Quick reference: prompt checklist

| Include | Example |
|---------|---------|
| Tier XS/S/M/L | `Tier S` |
| Goal (one sentence) | `Goal: …` |
| In scope paths | `packages/game-engine/src/play.ts` |
| Out of scope | `apps/web/**` |
| Owner package | `game-engine` |
| Success criteria | build commands + manual steps |
| Forbidden reminders | `No commit`, `No new deps` |
| Plan guard | `Plan only — no code` |
| Review guard | `Review only — no edits` |
| Handoff | `## Handoff` block for next agent |

---

## Long-context session tips

1. **Start new chat** for unrelated Tier M/L work — link `docs/agent-prompt-examples.md` + handoff block.
2. **Re-declare scope** after user pivot (“also fix audio”) — new tier assessment.
3. **Paste file:line** from previous agent only after verifying in current checkout.
4. **Subagents for read**, parent for **write** — reduces conflicting edits.
5. **Never** assume tests exist — say `Gate D` until Vitest is in repo.

---

## See also

- `AGENTS.md` — forbidden actions, gates, ownership
- `.cursor/rules.md` — critique log, tech-debt workflows
- `GAME_MECHANICS.md` — rules (not process)
