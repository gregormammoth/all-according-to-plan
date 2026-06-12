export * from './constants';
export * from './types';
export * from './utils';
import type { CardsDocument, CrisesDocument } from './types';
import rawCards from './data/cards.json';
import rawCrises from './data/crises.json';

export const cardsDocument = rawCards as CardsDocument;
export const crisesDocument = rawCrises as CrisesDocument;
