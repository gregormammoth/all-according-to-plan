# Game Mechanics Reference

Engine source of truth: `packages/game-engine` and `packages/shared`. The web client mirrors `GameState` and must not invent rules locally.

---

## Objective

Govern an authoritarian state for **25 rounds** with **3 actions per round**, then resolve a mandatory **event** each round. Win, survive, or fail based on faction health, **Legitimacy** and **Control** regime tracks, and stability index at round 25.

---

## Turn structure

### Player phase (`phase: 'player'`)

- `playerActionsUsed` starts at 0 each round.
- `maxPlayerActionsPerRound` is 3.
- Valid actions: `playCard`, `drawCard`, `gainResource`, `resolveCrisis`.
- When `playerActionsUsed` reaches 3 after any action, `beginEventModal` runs immediately.

### Event modal phase (`phase: 'event_modal'`)

`eventStep` progression:

| Step | Player action | Engine function |
|------|---------------|-----------------|
| `choice` | Select a response | `chooseEventChoice(state, choiceId)` |
| `rolling` | (UI triggers roll) | `rollPendingEvent(state)` |
| `revealed` | (UI applies preview) | `applyRevealedOutcome(state)` |
| `applied` | Continue | `continueAfterAppliedEvent(library, state)` |

Event choices have **no resource cost** in the current build.

### Game over (`phase: 'game_over'`)

Terminal. No player actions. `gameResult` and `finalStatsSnapshot` are set.

---

## Factions and stats

Groups: `people`, `elites`, `security`.

Per group: `satisfaction`, `loyalty`, `fear` — each clamped to `[STAT_MIN, STAT_MAX]` = `[0, 10]`.

Helpers in `@all-according-to-plan/shared`: `applyStatEffects`, `clampStats`, `clampGroupStats`.

---

## Resources

`money`, `influence`, `authority` — non-negative after any delta (`clampResourcesNonNegative`).

`canPay` / `payCost` gate card plays.

---

## Regime tracks

Global stats on `GameState` (Arkham Horror–style regime health):

| Track | Initial | Range |
|-------|---------|-------|
| `legitimacy` | 75 | 0–100 |
| `control` | 75 | 0–100 |

Helpers in `@all-according-to-plan/shared`: `clampLegitimacy`, `clampControl`, `clampRegimeTracks`, `applyRegimeDelta`, `defaultRegimeTracks`.

### Collapse

`isRegimeCollapsed(state)` → `legitimacy <= 0` **or** `control <= 0`.

Checked at end of round in `continueAfterAppliedEvent` (after instability drift and faction pressure). On collapse:

- `phase` → `game_over`
- `gameResult.type` → `failure`
- `collapseCause` → `'legitimacy'` or `'control'` with themed summary text

Election failure no longer ends the game immediately; it applies legitimacy/control damage like other events.

---

## Crisis system

Persistent crises replace election-driven pressure while `ENABLE_ELECTIONS` is `false` in `packages/shared/src/constants.ts`.

### Active crises

`GameState.activeCrises: ActiveCrisis[]` where each entry tracks `crisisId`, `doom`, and `createdRound`.

Definitions live in `packages/shared/src/data/crises.json`.

### Spawning

`spawnRandomCrisis` runs at end of round (when the campaign continues) using deterministic RNG (`gameSeed`, `round`):

| Roll (1–100) | Result |
|--------------|--------|
| 1–30 | No spawn |
| 31–80 | Random **minor** crisis |
| 81–100 | Random **major** crisis |

Skipped when `activeCrises.length >= MAX_ACTIVE_CRISES` (4). Duplicate crisis types cannot spawn while already active.

### End of round

In `continueAfterAppliedEvent`, after instability drift and faction pressure:

1. Apply each active crisis `ongoingEffects` (legitimacy/control/resources/stats).
2. Increment `doom` on every active crisis.
3. When `doom >= CRISIS_DOOM_THRESHOLD` (5): apply `escalationEffects`, then **reset doom to 0** (crisis stays active until resolved).

### Resolution

Player action `resolveCrisis(crisisId)` during `player` phase:

1. Spend `resolution.actionCost` actions and `resolution.resourceCost` if defined.
2. If a test is defined: `deterministicRollPercent` vs difficulty, with +2% per legitimacy/control point above 50.
3. Apply `successEffects` or `failureEffects`.
4. Remove crisis when `successEffects.removeCrisis` is set (or on automatic success when no test).

### Elections (disabled)

Set `ENABLE_ELECTIONS = true` in `constants.ts` to restore election rounds on cycles 4, 8, 12, … (below round 25). Election code remains in `round.ts` unchanged.

### End-of-round pressure

After `applyInstabilityDrift`, passive damage from factions:

```
legitimacyLoss = (10 - people.satisfaction) * 0.8 + (10 - people.loyalty) * 0.4
controlLoss    = (10 - security.loyalty) * 0.6 + (10 - elites.loyalty) * 0.4
```

Constants live in `packages/game-engine/src/regime.ts`. Tracks are clamped after pressure.

### Card and event deltas

Optional `legitimacyDelta` / `controlDelta` on cards (immediate, passive, delayed) and event outcomes. Applied wherever stat/resource effects are applied.

---

## Player actions

### Play card (`playCard`)

 Preconditions: `player` phase, actions remaining, card in hand, affordable cost, asset not already active.

 On success:

1. Pay `card.cost`.
2. Apply `immediateEffects` to stats and any regime deltas on the block.
3. Apply `gain` to resources if present.
4. For each entry in `delayedEffects`, push `{ firesAtRound: round + 1, effects, legitimacyDelta?, controlDelta? }` onto `scheduledEffects`.
5. Remove card from `hand`.
6. If `card.type === 'asset'`: append to `activeAssets` (not discard).
7. If `card.type === 'event'`: append to `deckDiscard`.
8. Append to `playedCardIds` and `cardsPlayedThisRound`.
9. Increment `playerActionsUsed`; if 3, open event modal.

### Draw card (`drawCard`)

Uses `drawOneCard` with reshuffle options `{ gameSeed, round, reshuffleCount }`.

- Empty deck + empty discard → error.
- Hand full → drawn card goes to discard (**burned**), hand unchanged.

### Gain resource (`gainResource`)

+1 to selected resource type.

---

## Cards (data model)

Defined in `packages/shared/src/types.ts` and `data/cards.json`.

```ts
type Card = {
  id: string;
  name: string;
  description: string;
  type: 'asset' | 'event';
  archetype?: string;
  cost: Partial<Resources>;
  immediateEffects?: EffectBlock;
  passiveEffects?: EffectBlock[];
  gain?: Partial<Resources>;
  delayedEffects?: EffectBlock[];
  legitimacyDelta?: number;
  controlDelta?: number;
};
```

`EffectBlock` = `CardEffects` + optional regime deltas.

### Normalization (`state.ts`)

JSON may use legacy `type: 'propaganda'` etc. and `effects` instead of `immediateEffects`. The engine maps:

- Explicit `asset` / `event` → use as-is.
- Else: `economy`, `strategy`, `social` → **asset**; other archetypes → **event**.
- `effects` → `immediateEffects`.

### Passive assets

`applyPassiveEffects` runs at the start of a **new** round (after round increment in `continueAfterAppliedEvent`), iterating `activeAssets` and applying each card’s `passiveEffects[]`.

---

## Deck and hand

| Constant | Value |
|----------|-------|
| `MAX_HAND_CARDS` | 8 |
| `OPENING_HAND_CARDS` | 5 |
| `PLAYER_ACTIONS_PER_ROUND` | 3 |

Initial deck: shuffled card IDs from library (`shuffle` at campaign start).

### Reshuffle

When `deck.length === 0` and `discard.length > 0` during a draw:

- `reshuffleCount` increments.
- Seed: `hash32(\`${gameSeed}:${round}:reshuffle:${reshuffleCount}\`)`.
- Discard is Fisher–Yates shuffled into new deck; discard cleared.

### Draw outcomes

| Situation | Result |
|-----------|--------|
| Hand &lt; max, card on deck | Card added to hand |
| Hand = max | Card to discard (burned) |
| Deck empty, no discard | No card drawn |

`drawUntilHandSize` (opening hand) does not use reshuffle seeding — only mid-game draws via `drawOneCard` with options.

---

## Events

### Selection

- **Election rounds** (only when `ENABLE_ELECTIONS`): `isElectionRound(round)` → `round % 4 === 0 && round < 25` → `createElectionEvent(state)`.
- **Default:** `MOCK_EVENTS[(round - 1) % length]`.

### Choices and dice

Each choice defines:

```ts
probability: { success, partial, failure }  // percent bands, sum ≤ 100
outcomes: { success, partial, failure }       // statDeltas + resourceDeltas + regime deltas
```

`deterministicRollPercent(gameSeed, round, choiceId)` → integer 1–100.

Outcome bands:

- `roll <= success` → success
- `roll <= success + partial` → partial_success
- else → failure

### Election failure

Applies large legitimacy/control penalties via outcome deltas. The campaign continues unless regime tracks collapse at round end.

### Event failure

Does not end the run unless combined with regime collapse or faction failure at round end.

---

## End of round (`continueAfterAppliedEvent`)

After `eventStep === 'applied'`:

1. `applyInstabilityDrift`: per faction satisfaction −0.15, loyalty −0.1, fear +0.1.
2. `applyRegimePressure` on legitimacy/control from current stats.
3. Bonus `drawOneCard` (with reshuffle).
4. `+1 money` upkeep.
5. Push `eventHistory` entry.
6. **If** `round >= maxRounds` **or** `isFailureState(stats)` **or** `isRegimeCollapsed`:
   - `computeGameResult` → victory / survival / failure
   - `finalStatsSnapshot`, `game_over`, clear pending event fields.
7. **Else**:
   - `nextRound = round + 1`
   - `applyDueScheduled(stats, scheduledEffects, nextRound, legitimacy, control)` — includes regime deltas on scheduled items
   - `applyPassiveEffects` for new round — includes passive regime deltas
   - Re-check `isRegimeCollapsed` after scheduled/passive
   - Reset `playerActionsUsed`, `cardsPlayedThisRound`, `phase: 'player'`

### Failure check

`isFailureState`: all of `people.satisfaction`, `elites.satisfaction`, `security.satisfaction` ≤ 0.

### Victory / survival

- `stabilityIndex(stats)`: average per faction of `((satisfaction + loyalty - fear + 20) / 30) * 100`.
- `stable >= 62` → victory; else survival (if not failure).

### Score

`round(people.satisfaction×2 + elites.loyalty×2 + security.fear + money + influence + authority + legitimacy×0.5 + control×0.5)`

---

## Scheduled effects

On play, each `delayedEffects` block schedules:

```ts
{ firesAtRound: currentRound + 1, effects: block, legitimacyDelta?, controlDelta? }
```

At round transition, effects with `firesAtRound === nextRound` are applied via `applyStatEffects` and `applyRegimeDelta`, then removed from the queue.

---

## Deterministic RNG

`packages/game-engine/src/rng.ts`:

- `hash32(string)` for seeds
- `createSeededRng(seed)` — mulberry32
- `deterministicRollPercent(gameSeed, round, choiceId)` for event dice
- Deck reshuffle uses `gameSeed:round:reshuffle:reshuffleCount`

Campaign `gameSeed` defaults to `1337` in `createInitialState`.

---

## Validation errors (examples)

| Error | Cause |
|-------|--------|
| `Not in player phase` | Action during event modal or game over |
| `No actions remaining` | Fourth action attempt |
| `Insufficient resources` | Cannot pay card cost |
| `Asset is already active` | Replay same asset |
| `Deck is empty` | Draw with empty deck and discard |
| `No event is awaiting choice` | Wrong event step / phase |

---

## GameState fields (summary)

| Field | Purpose |
|-------|---------|
| `round`, `maxRounds` | Campaign progress |
| `phase`, `eventStep` | UI gating |
| `gameSeed`, `reshuffleCount` | Deterministic deck/events |
| `pendingEvent`, `pendingChoiceId`, `diceResult` | Event modal |
| `statChangesPreview`, `resourceChangesPreview`, `regimeChangesPreview` | Pre-apply outcome |
| `stats`, `resources`, `legitimacy`, `control` | Core simulation |
| `hand`, `deck`, `deckDiscard` | Card zones |
| `activeAssets` | Persistent assets |
| `playedCardIds`, `cardsPlayedThisRound` | History / UI |
| `scheduledEffects` | Delayed card effects |
| `activeCrises` | Persistent crisis instances |
| `eventHistory`, `lastResolvedEvent`, `activeEventIds` | Events |
| `gameResult`, `finalStatsSnapshot` | End screen |
| `log` | Text trace |

---

## API note

`apps/api` exposes placeholder endpoints; full `GameState` serialization is not required for local play — the web client runs the engine in-browser via Zustand.

---

## UI mapping (web)

| Engine phase | UI behavior |
|--------------|-------------|
| `player` | Card bar + draw/gain enabled |
| `event_modal` | `EventModal` blocks; actions disabled |
| `game_over` | `GameOverScreen` replaces playfield |

Event modal auto-advances `rolling` → `revealed` → `applied` with timed steps; player confirms at choice and continue.
