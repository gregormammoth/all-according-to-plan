# Game Mechanics Reference

Engine source of truth: `packages/game-engine` and `packages/shared`. The web client mirrors `GameState` and must not invent rules locally.

---

## Objective

Govern an authoritarian state for **25 rounds** with **3 actions per round**, then resolve a mandatory **event** each round. Win, survive, or fail based on final faction health, stability index, and special election failure.

---

## Turn structure

### Player phase (`phase: 'player'`)

- `playerActionsUsed` starts at 0 each round.
- `maxPlayerActionsPerRound` is 3.
- Valid actions: `playCard`, `drawCard`, `gainResource`.
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

## Player actions

### Play card (`playCard`)

 Preconditions: `player` phase, actions remaining, card in hand, affordable cost, asset not already active.

 On success:

1. Pay `card.cost`.
2. Apply `immediateEffects` to stats.
3. Apply `gain` to resources if present.
4. For each entry in `delayedEffects`, push `{ firesAtRound: round + 1, effects }` onto `scheduledEffects`.
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
  immediateEffects?: CardEffects;
  passiveEffects?: CardEffects[];
  gain?: Partial<Resources>;
  delayedEffects?: CardEffects[];
};
```

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

- **Election rounds:** `isElectionRound(round)` → `round % 4 === 0 && round < 25`.
  - `createElectionEvent(state)` with dynamic probabilities from stats.
- **Other rounds:** `MOCK_EVENTS[(round - 1) % length]`.

### Choices and dice

Each choice defines:

```ts
probability: { success, partial, failure }  // percent bands, sum ≤ 100
outcomes: { success, partial, failure }       // statDeltas + resourceDeltas
```

`deterministicRollPercent(gameSeed, round, choiceId)` → integer 1–100.

Outcome bands:

- `roll <= success` → success
- `roll <= success + partial` → partial_success
- else → failure

### Election failure (instant game over)

If `pendingEvent.type === 'election'` and dice outcome is `failure`:

- `phase` → `game_over` immediately (no `continueAfterAppliedEvent` upkeep).
- `gameResult.type` = `failure`, summary about lost election.

### Normal event failure

Does not end the run unless combined with collapse at round end.

---

## End of round (`continueAfterAppliedEvent`)

After `eventStep === 'applied'`:

1. `applyInstabilityDrift`: per faction satisfaction −0.15, loyalty −0.1, fear +0.1.
2. Bonus `drawOneCard` (with reshuffle).
3. `+1 money` upkeep.
4. Push `eventHistory` entry.
5. **If** `round >= maxRounds` **or** `isFailureState(stats)`:
   - `computeGameResult` → victory / survival / failure
   - `finalStatsSnapshot`, `game_over`, clear pending event fields.
6. **Else**:
   - `nextRound = round + 1`
   - `applyDueScheduled(stats, scheduledEffects, nextRound)`
   - `applyPassiveEffects` for new round
   - Reset `playerActionsUsed`, `cardsPlayedThisRound`, `phase: 'player'`

### Failure check

`isFailureState`: all of `people.satisfaction`, `elites.satisfaction`, `security.satisfaction` ≤ 0.

### Victory / survival

- `stabilityIndex(stats)`: average per faction of `((satisfaction + loyalty - fear + 20) / 30) * 100`.
- `stable >= 62` → victory; else survival (if not failure).

### Score

`round(people.satisfaction×2 + elites.loyalty×2 + security.fear + money + influence + authority)`

---

## Scheduled effects

On play, each `delayedEffects` block schedules:

```ts
{ firesAtRound: currentRound + 1, effects: block }
```

At round transition, effects with `firesAtRound === nextRound` are applied via `applyStatEffects` and removed from the queue.

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
| `statChangesPreview`, `resourceChangesPreview` | Pre-apply outcome |
| `stats`, `resources` | Core simulation |
| `hand`, `deck`, `deckDiscard` | Card zones |
| `activeAssets` | Persistent assets |
| `playedCardIds`, `cardsPlayedThisRound` | History / UI |
| `scheduledEffects` | Delayed card effects |
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
