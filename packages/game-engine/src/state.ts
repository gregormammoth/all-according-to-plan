import {
  cardsDocument,
  MAX_HAND_CARDS,
  OPENING_HAND_CARDS,
  PLAYER_ACTIONS_PER_ROUND,
  type CardEffects,
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

function inferCardType(archetype: string): 'asset' | 'event' {
  return archetype === 'economy' || archetype === 'strategy' || archetype === 'social'
    ? 'asset'
    : 'event';
}

function toArrayEffects(value: unknown): CardEffects[] {
  if (!value) return [];
  if (Array.isArray(value)) return value as CardEffects[];
  return [value as CardEffects];
}

function normalizeCard(source: any): Card {
  const archetype = typeof source.type === 'string' ? source.type : 'event';
  const immediate = source.immediateEffects ?? source.effects;
  const passive = source.passiveEffects ?? [];
  const delayed = source.delayedEffects ?? [];
  return {
    id: source.id,
    name: source.name,
    description: source.description,
    archetype,
    type: source.type === 'asset' || source.type === 'event' ? source.type : inferCardType(archetype),
    cost: source.cost ?? {},
    immediateEffects: immediate,
    passiveEffects: toArrayEffects(passive),
    delayedEffects: toArrayEffects(delayed),
    gain: source.gain,
  };
}

function normalizeCards(cards: any[]): Card[] {
  return cards.map(normalizeCard);
}

export function createInitialState(cards?: Card[]): GameState {
  const source = cards ?? normalizeCards(cardsDocument.cards as any[]);
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
    gameSeed: 1337,
    pendingEvent: null,
    pendingChoiceId: null,
    diceResult: null,
    eventStep: 'idle',
    lastOutcomeSummary: null,
    statChangesPreview: null,
    resourceChangesPreview: null,
    reshuffleCount: 0,
    lastDeckAction: null,
    stats: defaultStats(),
    resources: defaultResources(),
    hand: drawn.hand,
    deck: drawn.deck,
    deckDiscard: drawn.discard,
    activeAssets: [],
    playedCardIds: [],
    cardsPlayedThisRound: [],
    activeEventIds: [],
    eventHistory: [],
    lastResolvedEvent: null,
    scheduledEffects: [],
    gameResult: null,
    finalStatsSnapshot: null,
    log: ['Campaign opened.'],
  };
}

export function getDefaultLibrary(cards?: Card[]): CardLibrary {
  const source = cards ?? normalizeCards(cardsDocument.cards as any[]);
  return buildCardLibrary(source);
}
