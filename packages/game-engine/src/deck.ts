export function drawOneCard(
  hand: readonly string[],
  deck: readonly string[],
  discard: readonly string[],
  maxHand: number
): { hand: string[]; deck: string[]; discard: string[]; drewId: string | null; burned: boolean } {
  if (deck.length === 0) {
    return { hand: [...hand], deck: [...deck], discard: [...discard], drewId: null, burned: false };
  }
  const nextDeck = [...deck];
  const drewId = nextDeck.shift();
  if (drewId === undefined) {
    return { hand: [...hand], deck: nextDeck, discard: [...discard], drewId: null, burned: false };
  }
  if (hand.length < maxHand) {
    return { hand: [...hand, drewId], deck: nextDeck, discard: [...discard], drewId, burned: false };
  }
  return { hand: [...hand], deck: nextDeck, discard: [...discard, drewId], drewId, burned: true };
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
