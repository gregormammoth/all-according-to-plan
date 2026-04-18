import {
  cardsDocument,
  MAX_HAND_CARDS,
  OPENING_HAND_CARDS,
  PLAYER_ACTIONS_PER_ROUND,
  type Card,
  type GameState,
  type PlayerStats,
  type Resources,
} from '@all-according-to-plan/shared';
import { buildCardLibrary, type CardLibrary } from './library';
import { drawUntilHandSize } from './deck';
import { shuffle } from './shuffle';

export { MAX_HAND_CARDS } from '@all-according-to-plan/shared';

export const DEFAULT_MAX_ROUNDS = 25;

const defaultStats = (): PlayerStats => ({
  people: { satisfaction: 6, loyalty: 5, fear: 4 },
  elites: { satisfaction: 5, loyalty: 6, fear: 3 },
  security: { satisfaction: 5, loyalty: 5, fear: 5 },
});

const defaultResources = (): Resources => ({
  money: 14,
  influence: 0,
  authority: 0,
});

export function createInitialState(cards?: Card[]): GameState {
  const source = cards ?? cardsDocument.cards;
  const ids = shuffle(source.map((c) => c.id));
  const deck = [...ids];
  const emptyDiscard: string[] = [];
  const drawn = drawUntilHandSize([], deck, OPENING_HAND_CARDS, MAX_HAND_CARDS, emptyDiscard);
  return {
    round: 1,
    maxRounds: DEFAULT_MAX_ROUNDS,
    maxPlayerActionsPerRound: PLAYER_ACTIONS_PER_ROUND,
    playerActionsUsed: 0,
    phase: 'player',
    pendingEvent: null,
    stats: defaultStats(),
    resources: defaultResources(),
    hand: drawn.hand,
    deck: drawn.deck,
    deckDiscard: drawn.discard,
    playedCardIds: [],
    cardsPlayedThisRound: [],
    activeEventIds: [],
    eventHistory: [],
    lastResolvedEvent: null,
    scheduledEffects: [],
    log: ['Campaign opened.'],
  };
}

export function getDefaultLibrary(cards?: Card[]): CardLibrary {
  const source = cards ?? cardsDocument.cards;
  return buildCardLibrary(source);
}
