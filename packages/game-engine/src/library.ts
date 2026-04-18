import type { Card } from '@all-according-to-plan/shared';

export type CardLibrary = Map<string, Card>;

export function buildCardLibrary(cards: Card[]): CardLibrary {
  return new Map(cards.map((c) => [c.id, c]));
}
