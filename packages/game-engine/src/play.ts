import {
  applyResourceDelta,
  applyStatEffects,
  canPay,
  clampResourcesNonNegative,
  payCost,
  regimeDeltaFromBlock,
  type GameState,
  type ResourceType,
  type Resources,
} from '@all-according-to-plan/shared';
import type { CardLibrary } from './library';
import type { CrisisLibrary } from './crisis-library';
import { applyCrisisOutcome, beginCrisisResolve, rollPendingCrisis, resolveCrisis as resolveCrisisEngine } from './crisis';
import { drawOneCard } from './deck';
import { applyRegimeDeltaToState } from './regime';
import { beginEventModal } from './round';
import { MAX_HAND_CARDS } from './state';

export type PlayResult =
  | { ok: true; state: GameState }
  | { ok: false; error: string };

function afterPlayerAction(state: GameState): GameState {
  if (state.playerActionsUsed >= state.maxPlayerActionsPerRound) {
    return beginEventModal(state);
  }
  return state;
}

export function playCard(library: CardLibrary, state: GameState, cardId: string): PlayResult {
  if (state.phase === 'game_over') {
    return { ok: false, error: 'Campaign concluded.' };
  }
  if (state.phase !== 'player') {
    return { ok: false, error: 'Not in player phase.' };
  }
  if (state.playerActionsUsed >= state.maxPlayerActionsPerRound) {
    return { ok: false, error: 'No actions remaining this round.' };
  }
  const card = library.get(cardId);
  if (!card) {
    return { ok: false, error: 'Unknown card.' };
  }
  if (!state.hand.includes(cardId)) {
    return { ok: false, error: 'Card not in hand.' };
  }
  if (card.type === 'asset' && state.activeAssets.includes(cardId)) {
    return { ok: false, error: 'Asset is already active.' };
  }
  if (!canPay(state.resources, card.cost)) {
    return { ok: false, error: 'Insufficient resources.' };
  }
  let resources = clampResourcesNonNegative(payCost(state.resources, card.cost));
  let stats = state.stats;
  let legitimacy = state.legitimacy;
  let control = state.control;
  if (card.immediateEffects) {
    stats = applyStatEffects(stats, card.immediateEffects);
    const tracks = applyRegimeDeltaToState(legitimacy, control, regimeDeltaFromBlock(card.immediateEffects));
    legitimacy = tracks.legitimacy;
    control = tracks.control;
  } else if (card.legitimacyDelta !== undefined || card.controlDelta !== undefined) {
    const tracks = applyRegimeDeltaToState(legitimacy, control, {
      legitimacyDelta: card.legitimacyDelta,
      controlDelta: card.controlDelta,
    });
    legitimacy = tracks.legitimacy;
    control = tracks.control;
  }
  if (card.gain) {
    resources = clampResourcesNonNegative(applyResourceDelta(resources, card.gain));
  }
  const scheduledEffects = [...state.scheduledEffects];
  if (card.delayedEffects && card.delayedEffects.length > 0) {
    for (const delayed of card.delayedEffects) {
      scheduledEffects.push({
        firesAtRound: state.round + 1,
        effects: {
          people: delayed.people,
          elites: delayed.elites,
          security: delayed.security,
        },
        legitimacyDelta: delayed.legitimacyDelta,
        controlDelta: delayed.controlDelta,
      });
    }
  }
  const nextActionIndex = state.playerActionsUsed + 1;
  const hand = state.hand.filter((id) => id !== cardId);
  const activeAssets =
    card.type === 'asset' && !state.activeAssets.includes(cardId)
      ? [...state.activeAssets, cardId]
      : state.activeAssets;
  const deckDiscard =
    card.type === 'event' ? [...state.deckDiscard, cardId] : state.deckDiscard;
  const playedCardIds = [...state.playedCardIds, cardId];
  const cardsPlayedThisRound = [...state.cardsPlayedThisRound, cardId];
  const log = [...state.log, `Round ${state.round} action ${nextActionIndex}: played ${card.name}`];
  let nextState: GameState = {
    ...state,
    stats,
    resources,
    legitimacy,
    control,
    hand,
    activeAssets,
    deckDiscard,
    playedCardIds,
    cardsPlayedThisRound,
    playerActionsUsed: nextActionIndex,
    scheduledEffects,
    log,
  };
  nextState = afterPlayerAction(nextState);
  return { ok: true, state: nextState };
}

export function drawCard(_library: CardLibrary, state: GameState): PlayResult {
  if (state.phase === 'game_over') {
    return { ok: false, error: 'Campaign concluded.' };
  }
  if (state.phase !== 'player') {
    return { ok: false, error: 'Not in player phase.' };
  }
  if (state.playerActionsUsed >= state.maxPlayerActionsPerRound) {
    return { ok: false, error: 'No actions remaining this round.' };
  }
  if (state.deck.length === 0 && state.deckDiscard.length === 0) {
    return { ok: false, error: 'Deck is empty.' };
  }
  const nextActionIndex = state.playerActionsUsed + 1;
  const step = drawOneCard(state.hand, state.deck, state.deckDiscard, MAX_HAND_CARDS, {
    gameSeed: state.gameSeed,
    round: state.round,
    reshuffleCount: state.reshuffleCount,
  });
  const logLine =
    step.drewId === null
      ? `Round ${state.round} action ${nextActionIndex}: draw (empty deck)`
      : step.reshuffled
        ? `Round ${state.round} action ${nextActionIndex}: deck reshuffled, then drew a card`
      : step.burned
        ? `Round ${state.round} action ${nextActionIndex}: draw burned top card (hand full)`
        : `Round ${state.round} action ${nextActionIndex}: drew a card`;
  let nextState: GameState = {
    ...state,
    hand: step.hand,
    deck: step.deck,
    deckDiscard: step.discard,
    reshuffleCount: step.reshuffleCount,
    lastDeckAction: step.lastDeckAction,
    playerActionsUsed: nextActionIndex,
    log: [...state.log, logLine],
  };
  nextState = afterPlayerAction(nextState);
  return { ok: true, state: nextState };
}

export function gainResource(_library: CardLibrary, state: GameState, resource: ResourceType): PlayResult {
  if (state.phase === 'game_over') {
    return { ok: false, error: 'Campaign concluded.' };
  }
  if (state.phase !== 'player') {
    return { ok: false, error: 'Not in player phase.' };
  }
  if (state.playerActionsUsed >= state.maxPlayerActionsPerRound) {
    return { ok: false, error: 'No actions remaining this round.' };
  }
  const nextActionIndex = state.playerActionsUsed + 1;
  const patch: Partial<Resources> =
    resource === 'money'
      ? { money: 1 }
      : resource === 'influence'
        ? { influence: 1 }
        : { authority: 1 };
  const resources = clampResourcesNonNegative(applyResourceDelta(state.resources, patch));
  const log = [...state.log, `Round ${state.round} action ${nextActionIndex}: gained +1 ${resource}`];
  let nextState: GameState = {
    ...state,
    resources,
    playerActionsUsed: nextActionIndex,
    log,
  };
  nextState = afterPlayerAction(nextState);
  return { ok: true, state: nextState };
}

export function startCrisisResolve(
  _cardLibrary: CardLibrary,
  crisisLibrary: CrisisLibrary,
  state: GameState,
  crisisId: string
): PlayResult {
  const res = beginCrisisResolve(state, crisisId, crisisLibrary);
  if (!res.ok) {
    return res;
  }
  if (res.state.phase === 'crisis_modal') {
    return { ok: true, state: res.state };
  }
  const nextState = afterPlayerAction(res.state);
  return { ok: true, state: nextState };
}

export function rollCrisisTestAction(crisisLibrary: CrisisLibrary, state: GameState): PlayResult {
  const res = rollPendingCrisis(state, crisisLibrary);
  if (!res.ok) {
    return res;
  }
  return { ok: true, state: res.state };
}

export function applyCrisisResolution(
  _cardLibrary: CardLibrary,
  crisisLibrary: CrisisLibrary,
  state: GameState
): PlayResult {
  const res = applyCrisisOutcome(state, crisisLibrary);
  if (!res.ok) {
    return res;
  }
  const nextState = afterPlayerAction(res.state);
  return { ok: true, state: nextState };
}

export function resolveCrisis(
  _cardLibrary: CardLibrary,
  crisisLibrary: CrisisLibrary,
  state: GameState,
  crisisId: string
): PlayResult {
  const res = resolveCrisisEngine(state, crisisId, crisisLibrary);
  if (!res.ok) {
    return res;
  }
  const nextState = afterPlayerAction(res.state);
  return { ok: true, state: nextState };
}
