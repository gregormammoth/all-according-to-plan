import { createSeededRng, hash32 } from './rng';

function seededShuffle(input: readonly string[], seed: number): string[] {
  const out = [...input];
  const rng = createSeededRng(seed);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

export function reshuffleDiscardIntoDeck(params: {
  deck: readonly string[];
  discard: readonly string[];
  gameSeed: number;
  round: number;
  reshuffleCount: number;
}): { deck: string[]; discard: string[]; reshuffleCount: number; reshuffled: boolean } {
  if (params.deck.length > 0 || params.discard.length === 0) {
    return {
      deck: [...params.deck],
      discard: [...params.discard],
      reshuffleCount: params.reshuffleCount,
      reshuffled: false,
    };
  }
  const nextCount = params.reshuffleCount + 1;
  const seed = hash32(`${params.gameSeed}:${params.round}:reshuffle:${nextCount}`);
  const deck = seededShuffle(params.discard, seed);
  return {
    deck,
    discard: [],
    reshuffleCount: nextCount,
    reshuffled: true,
  };
}

export function drawOneCard(
  hand: readonly string[],
  deck: readonly string[],
  discard: readonly string[],
  maxHand: number,
  options?: { gameSeed: number; round: number; reshuffleCount: number }
): {
  hand: string[];
  deck: string[];
  discard: string[];
  drewId: string | null;
  burned: boolean;
  reshuffleCount: number;
  reshuffled: boolean;
  lastDeckAction: 'draw' | 'reshuffle' | null;
} {
  let nextDeck = [...deck];
  let nextDiscard = [...discard];
  let nextReshuffleCount = options?.reshuffleCount ?? 0;
  let reshuffled = false;
  if (nextDeck.length === 0 && options) {
    const step = reshuffleDiscardIntoDeck({
      deck: nextDeck,
      discard: nextDiscard,
      gameSeed: options.gameSeed,
      round: options.round,
      reshuffleCount: nextReshuffleCount,
    });
    nextDeck = step.deck;
    nextDiscard = step.discard;
    nextReshuffleCount = step.reshuffleCount;
    reshuffled = step.reshuffled;
  }
  if (nextDeck.length === 0) {
    return {
      hand: [...hand],
      deck: nextDeck,
      discard: nextDiscard,
      drewId: null,
      burned: false,
      reshuffleCount: nextReshuffleCount,
      reshuffled,
      lastDeckAction: reshuffled ? 'reshuffle' : null,
    };
  }
  const drewId = nextDeck.shift();
  if (drewId === undefined) {
    return {
      hand: [...hand],
      deck: nextDeck,
      discard: nextDiscard,
      drewId: null,
      burned: false,
      reshuffleCount: nextReshuffleCount,
      reshuffled,
      lastDeckAction: reshuffled ? 'reshuffle' : null,
    };
  }
  if (hand.length < maxHand) {
    return {
      hand: [...hand, drewId],
      deck: nextDeck,
      discard: nextDiscard,
      drewId,
      burned: false,
      reshuffleCount: nextReshuffleCount,
      reshuffled,
      lastDeckAction: reshuffled ? 'reshuffle' : 'draw',
    };
  }
  return {
    hand: [...hand],
    deck: nextDeck,
    discard: [...nextDiscard, drewId],
    drewId,
    burned: true,
    reshuffleCount: nextReshuffleCount,
    reshuffled,
    lastDeckAction: reshuffled ? 'reshuffle' : 'draw',
  };
}

export function drawUntilHandSize(
  hand: readonly string[],
  deck: readonly string[],
  target: number,
  maxHand: number,
  discard: readonly string[]
): { hand: string[]; deck: string[]; discard: string[] } {
  let nextHand = [...hand];
  let nextDeck = [...deck];
  let nextDiscard = [...discard];
  while (nextHand.length < target && nextHand.length < maxHand && nextDeck.length > 0) {
    const step = drawOneCard(nextHand, nextDeck, nextDiscard, maxHand);
    nextHand = step.hand;
    nextDeck = step.deck;
    nextDiscard = step.discard;
  }
  return { hand: nextHand, deck: nextDeck, discard: nextDiscard };
}
