export * from './constants';
export * from './types';
export * from './utils';
import type { CardsDocument } from './types';
import rawCards from './data/cards.json';

export const cardsDocument = rawCards as CardsDocument;
