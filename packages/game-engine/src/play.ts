import {
  applyResourceDelta,
  applyStatEffects,
  canPay,
  clampResourcesNonNegative,
  payCost,
  type GameState,
} from '@all-according-to-plan/shared';
import type { CardLibrary } from './library';
import { resolveRoundEnd } from './round';
import { drawUntilHandSize, HAND_SIZE } from './state';

export type PlayResult =
  | { ok: true; state: GameState }
  | { ok: false; error: string };

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
  if (!canPay(state.resources, card.cost)) {
    return { ok: false, error: 'Insufficient resources.' };
  }
  let resources = clampResourcesNonNegative(payCost(state.resources, card.cost));
  const stats = applyStatEffects(state.stats, card.effects);
  if (card.gain) {
    resources = clampResourcesNonNegative(applyResourceDelta(resources, card.gain));
  }
  const scheduledEffects = [...state.scheduledEffects];
  if (card.delayedEffects) {
    scheduledEffects.push({ firesAtRound: state.round + 1, effects: card.delayedEffects });
  }
  const nextActionIndex = state.playerActionsUsed + 1;
  const hand = state.hand.filter((id) => id !== cardId);
  const playedCardIds = [...state.playedCardIds, cardId];
  const cardsPlayedThisRound = [...state.cardsPlayedThisRound, cardId];
  const drawn = drawUntilHandSize(hand, state.deck, HAND_SIZE);
  const log = [...state.log, `Round ${state.round} action ${nextActionIndex}: ${card.name}`];
  let nextState: GameState = {
    ...state,
    stats,
    resources,
    hand: drawn.hand,
    deck: drawn.deck,
    playedCardIds,
    cardsPlayedThisRound,
    playerActionsUsed: nextActionIndex,
    scheduledEffects,
    log,
  };
  if (nextActionIndex >= state.maxPlayerActionsPerRound) {
    nextState = resolveRoundEnd(nextState);
  }
  return { ok: true, state: nextState };
}

export function finishPlayerPhaseEarly(_library: CardLibrary, state: GameState): PlayResult {
  if (state.phase === 'game_over') {
    return { ok: false, error: 'Campaign concluded.' };
  }
  if (state.phase !== 'player') {
    return { ok: false, error: 'Not in player phase.' };
  }
  if (state.playerActionsUsed === 0) {
    return { ok: false, error: 'Play at least one card before ending the player phase.' };
  }
  if (state.playerActionsUsed >= state.maxPlayerActionsPerRound) {
    return { ok: false, error: 'Player phase already complete.' };
  }
  return { ok: true, state: resolveRoundEnd(state) };
}
