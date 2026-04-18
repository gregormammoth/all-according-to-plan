import {
  cardsDocument,
  type Card,
  type GameState,
  type PlayerStats,
  type Resources,
} from '@all-according-to-plan/shared';
import { buildCardLibrary, type CardLibrary } from './library';
import { shuffle } from './shuffle';

export const HAND_SIZE = 6;

export const DEFAULT_MAX_ROUNDS = 25;

export const DEFAULT_ACTIONS_PER_ROUND = 3;

const defaultStats = (): PlayerStats => ({
  people: { satisfaction: 6, loyalty: 5, fear: 4 },
  elites: { satisfaction: 5, loyalty: 6, fear: 3 },
  security: { satisfaction: 5, loyalty: 5, fear: 5 },
});

const defaultResources = (): Resources => ({
  money: 14,
  influence: 0, //7,
  authority: 0, //6,
});

export function drawUntilHandSize(
  hand: string[],
  deck: string[],
  target: number
): { hand: string[]; deck: string[] } {
  const nextHand = [...hand];
  const nextDeck = [...deck];
  while (nextHand.length < target && nextDeck.length > 0) {
    const id = nextDeck.shift();
    if (id) nextHand.push(id);
  }
  return { hand: nextHand, deck: nextDeck };
}

export function createInitialState(cards?: Card[]): GameState {
  const source = cards ?? cardsDocument.cards;
  const ids = shuffle(source.map((c) => c.id));
  let hand: string[] = [];
  let deck = [...ids];
  const drawn = drawUntilHandSize(hand, deck, HAND_SIZE);
  hand = drawn.hand;
  deck = drawn.deck;
  return {
    round: 1,
    maxRounds: DEFAULT_MAX_ROUNDS,
    maxPlayerActionsPerRound: DEFAULT_ACTIONS_PER_ROUND,
    playerActionsUsed: 0,
    phase: 'player',
    stats: defaultStats(),
    resources: defaultResources(),
    hand,
    deck,
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
