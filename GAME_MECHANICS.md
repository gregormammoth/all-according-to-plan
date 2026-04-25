# All According to Plan - Game Mechanics

## Core Objective
The player governs a fragile authoritarian state across a fixed-length campaign. Each round, the player spends a limited action budget to stabilize faction dynamics while preserving resources. The run ends after round 25.

## Campaign Structure
- Total rounds: 25
- Actions per round: 3
- Main phases:
  - Player phase
  - Event modal phase
  - End-of-round upkeep and transition

## Factions and Stats
The simulation tracks three factions:
- People
- Elites
- Security

Each faction has three stats (clamped to 0..10):
- Satisfaction
- Loyalty
- Fear

Many cards and events push these values up or down. A derived stability index summarizes overall state pressure for UI feedback.

## Resources
The player manages three resources:
- Money
- Influence
- Authority

Rules:
- Card costs are paid from these resources
- Resources cannot go below zero
- Some cards and events grant or remove resources

## Deck and Hand System
The run uses a shuffled deck of card ids built from shared card data.

Hand rules:
- Maximum hand size: 8
- Starting hand: 5
- Draw action draws one card
- If hand is full when drawing, the drawn card is burned to discard

Deck state:
- `hand`: cards currently available to play
- `deck`: remaining draw pile
- `deckDiscard`: burned/overflow cards
- `playedCardIds`: permanent play history
- `cardsPlayedThisRound`: round-local play history

## Player Actions (Exactly 3 per Round)
Each action consumes one action point. Available actions:

### 1) Play Card
- Card must be in hand
- Card cost must be affordable
- On success:
  - cost is paid
  - immediate faction effects are applied
  - optional card resource gain is applied
  - optional delayed effects are scheduled for next round
  - card is removed from hand

### 2) Draw Card
- Draw one card from deck
- If deck is empty, action is rejected
- If hand is at cap, card is burned to discard

### 3) Gain Resource
- Choose one:
  - money
  - influence
  - authority
- Gain +1 of selected resource

## Events and Modal Gating
After the third action, the game does not immediately advance. It enters `event_modal` phase.

Flow:
1. Event for current round is selected
2. `pendingEvent` is set
3. UI opens blocking event modal
4. Player must press Continue

Only after acknowledgment does the engine resolve event consequences and advance the round.

## End-of-Round Resolution Order
When the event modal is acknowledged, the engine resolves in this order:
1. Apply event faction effects
2. Apply event resource deltas
3. Apply instability drift
4. Bonus draw (1 card, respecting hand cap and burn rule)
5. Upkeep gain: +1 money
6. Record event in history and last-resolved snapshot
7. Advance round and reset player actions
8. Apply scheduled delayed effects due at the new round

## Delayed Effects
Some cards define `delayedEffects`.

Rules:
- On play, delayed effects are scheduled for `round + 1`
- During round transition, any effects due at the new round are applied automatically
- Applied delayed effects are removed from the schedule

## Phase Rules
- `player`: actions available
- `event_modal`: action UI disabled until acknowledgment
- `game_over`: terminal state after final round resolution

## Round End and Game Over
If current round is 25 when event resolution occurs:
- final event and upkeep are still resolved
- phase becomes `game_over`
- no further actions are possible

## Error and Validation Rules
The engine returns explicit errors for invalid requests, including:
- not in player phase
- no actions remaining
- unknown card
- card not in hand
- insufficient resources
- empty deck on draw
- no pending event to acknowledge

## UI Behavioral Notes
The web client mirrors engine state and enforces clarity:
- Hand cards are visually marked playable/non-playable by affordability and phase
- Action controls disable in event modal and game over
- Event modal blocks progression until Continue
- Timeline and advisor panels reflect current phase and round

## State Snapshot Summary
Key fields in `GameState`:
- `round`, `maxRounds`
- `playerActionsUsed`, `maxPlayerActionsPerRound`
- `phase`, `pendingEvent`
- `stats`, `resources`
- `hand`, `deck`, `deckDiscard`
- `playedCardIds`, `cardsPlayedThisRound`
- `eventHistory`, `lastResolvedEvent`
- `scheduledEffects`, `log`

## Design Intent
The system is designed to feel like a structured tabletop loop:
- strict action economy
- constrained hand management
- visible consequence windows via events
- deterministic, pure engine transitions independent from React
